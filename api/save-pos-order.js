function json(res,status,body){res.status(status).json(body)}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return json(res,503,{error:'Cloud sync not configured'});
 const o=req.body||{};if(!o.id||!Array.isArray(o.items))return json(res,400,{error:'Invalid POS order'});
 const phone=String(o.phone||'').replace(/\D/g,'').slice(-10);const invoice=`POS-${String(o.id)}`;
 const payload={invoice_number:invoice,customer_name:o.customer||'',customer_phone:phone,order_type:o.type||'POS',delivery_address:o.address||'',items:o.items,subtotal:Number(o.subtotal||0),discount:Number(o.discount||0),handling_fee:Number(o.delivery||0)+Number(o.packing||0),total:Number(o.total||0),payment_method:o.payment||'',payment_status:'Recorded',channel:o.type||'POS',order_status:o.status||'Completed',created_at:o.date||new Date().toISOString(),paid_at:o.date||new Date().toISOString()};
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'};
 try{let r=await fetch(`${url}/rest/v1/orders?on_conflict=invoice_number`,{method:'POST',headers,body:JSON.stringify(payload)});if(!r.ok)throw Error(await r.text());if(phone){let q=await fetch(`${url}/rest/v1/customers?phone=eq.${phone}&select=*`,{headers});let ex=q.ok?(await q.json())[0]:null;let c={phone,name:o.customer||ex?.name||'',address:o.address||ex?.address||'',order_count:Number(ex?.order_count||0)+1,total_spend:Number(ex?.total_spend||0)+Number(o.total||0),last_order_at:o.date||new Date().toISOString(),updated_at:new Date().toISOString()};r=await fetch(`${url}/rest/v1/customers?on_conflict=phone`,{method:'POST',headers,body:JSON.stringify(c)});if(!r.ok)throw Error(await r.text())}return json(res,200,{ok:true})}catch(e){return json(res,500,{error:e.message})}
}
