function json(res,status,body){res.status(status).json(body)}
function cleanPhone(v){return String(v||'').replace(/\D/g,'').slice(-10)}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return json(res,503,{error:'Cloud sync is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.'});
 const o=req.body||{}; const phone=cleanPhone(o.customerPhone);
 if(!o.invoiceNumber||!phone||!Array.isArray(o.items)||!o.items.length)return json(res,400,{error:'Invalid order payload'});
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'};
 try{
  const orderPayload={invoice_number:String(o.invoiceNumber),customer_name:String(o.customerName||''),customer_phone:phone,order_type:String(o.orderType||''),delivery_address:String(o.deliveryAddress||''),landmark:String(o.landmark||''),schedule_text:String(o.scheduleText||''),note:String(o.note||''),items:o.items,subtotal:Number(o.subtotal||0),discount:Number(o.promoDiscount||0),platform_fee:Number(o.platformFee||0),handling_fee:Number(o.handlingFee||0),total:Number(o.total||0),payment_method:String(o.paymentMethod||'Razorpay'),payment_status:String(o.paymentStatus||'Verified'),payment_id:String(o.paymentId||''),razorpay_order_id:String(o.razorpayOrderId||''),channel:'Website',order_status:'Paid',created_at:o.createdAt||new Date().toISOString(),paid_at:o.paidAt||new Date().toISOString()};
  let r=await fetch(`${url}/rest/v1/orders?on_conflict=invoice_number`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(orderPayload)});
  if(!r.ok)throw new Error(`Order sync failed: ${await r.text()}`);
  const existingReq=await fetch(`${url}/rest/v1/customers?phone=eq.${encodeURIComponent(phone)}&select=*`,{headers});
  const existing=existingReq.ok?(await existingReq.json())[0]:null;
  const customer={phone,name:String(o.customerName||existing?.name||''),address:String(o.deliveryAddress||existing?.address||''),landmark:String(o.landmark||existing?.landmark||''),order_count:Number(existing?.order_count||0)+1,total_spend:Number(existing?.total_spend||0)+Number(o.total||0),last_order_at:o.paidAt||new Date().toISOString(),updated_at:new Date().toISOString()};
  r=await fetch(`${url}/rest/v1/customers?on_conflict=phone`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(customer)});
  if(!r.ok)throw new Error(`Customer sync failed: ${await r.text()}`);
  return json(res,200,{ok:true});
 }catch(e){console.error(e);return json(res,500,{error:e.message||'Sync failed'})}
}
