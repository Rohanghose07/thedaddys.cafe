function json(res,status,body){return res.status(status).json(body)}
function cleanPhone(v){return String(v||'').replace(/\D/g,'').slice(-10)}

async function supabaseFetch(url,key,path,options={}){
  const headers={
    apikey:key,
    Authorization:`Bearer ${key}`,
    'Content-Type':'application/json',
    ...(options.headers||{})
  };
  return fetch(`${url}/rest/v1/${path}`,{...options,headers});
}

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});

  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key){
    return json(res,503,{error:'Supabase cloud sync is not configured in Vercel.'});
  }

  const o=req.body||{};
  if(o.id===undefined || o.id===null || !Array.isArray(o.items) || !o.items.length){
    return json(res,400,{error:'Invalid POS order payload'});
  }

  const invoice=`POS-${String(o.id)}`;
  const phone=cleanPhone(o.phone);

  // Idempotency: retries/manual sync must not create duplicate POS orders.
  try{
    const existingReq=await supabaseFetch(
      url,key,
      `orders?or=(order_id.eq.${encodeURIComponent(invoice)},invoice_number.eq.${encodeURIComponent(invoice)})&select=id,order_id,invoice_number&limit=1`,
      {method:'GET'}
    );
    if(existingReq.ok){
      const existing=await existingReq.json();
      if(existing.length){
        return json(res,200,{ok:true,duplicate:true,invoice});
      }
    }

    const payload={
      order_id:invoice,
      invoice_number:invoice,
      customer_name:String(o.customer||''),
      customer_phone:phone,
      order_type:String(o.type||'POS'),
      note:String(o.notes||''),
      items:o.items,
      subtotal:Number(o.subtotal||0),
      discount:Number(o.discount||0),
      platform_fee:0,
      handling_fee:Number(o.delivery||0)+Number(o.packing||0),
      total:Number(o.total||0),
      payment_method:String(o.payment||''),
      payment_status:'Recorded',
      payment_id:String(o.ref||''),
      channel:'POS',
      order_status:String(o.status||'Completed'),
      created_at:o.date||new Date().toISOString(),
      paid_at:o.date||new Date().toISOString()
    };

    const orderReq=await supabaseFetch(url,key,'orders',{
      method:'POST',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify(payload)
    });
    const orderText=await orderReq.text();
    if(!orderReq.ok){
      console.error('POS order insert failed',orderReq.status,orderText);
      return json(res,500,{error:'Order sync failed',details:orderText});
    }

    // CRM update is best-effort; an order should not fail merely because no phone was supplied.
    if(phone){
      const existingCustomerReq=await supabaseFetch(
        url,key,`customers?phone=eq.${encodeURIComponent(phone)}&select=*`,{method:'GET'}
      );
      let existing=null;
      if(existingCustomerReq.ok){
        const rows=await existingCustomerReq.json();
        existing=rows[0]||null;
      }
      const customer={
        phone,
        name:String(o.customer||existing?.name||''),
        address:String(existing?.address||''),
        landmark:String(existing?.landmark||''),
        order_count:Number(existing?.order_count||0)+1,
        total_spend:Number(existing?.total_spend||0)+Number(o.total||0),
        last_order_at:o.date||new Date().toISOString(),
        updated_at:new Date().toISOString()
      };
      const customerReq=await supabaseFetch(url,key,'customers?on_conflict=phone',{
        method:'POST',
        headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify(customer)
      });
      if(!customerReq.ok){
        console.error('POS customer CRM update failed',await customerReq.text());
      }
    }

    return json(res,200,{ok:true,invoice});
  }catch(error){
    console.error('POS sync exception',error);
    return json(res,500,{error:error.message||'POS cloud sync failed'});
  }
}
