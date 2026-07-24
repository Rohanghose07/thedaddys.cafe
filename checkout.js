
"use strict";
const cart=JSON.parse(localStorage.getItem("tdcCart")||"[]");let orderType="Takeaway",applied=null;
const $=s=>document.querySelector(s), money=n=>`₹${Math.round(Number(n)||0)}`;
let checkoutStoreSettings=null;
function normalizePhone(v){let d=(v||"").replace(/\D/g,"");if(d.length===12&&d.startsWith("91"))d=d.slice(2);if(d.length===11&&d.startsWith("0"))d=d.slice(1);return d}
function promos(){try{return JSON.parse(localStorage.getItem("tdcPromos")||"[]")}catch{return[]}}
function redemptions(){try{return JSON.parse(localStorage.getItem("tdcPromoRedemptions")||"[]")}catch{return[]}}
function paidOrders(){try{return JSON.parse(localStorage.getItem("tdcAdminOrders")||"[]")}catch{return[]}}
function subtotal(){return cart.reduce((s,x)=>s+x.price*x.qty,0)}
function discountFor(p,s){let d=p.discountType==="percent"?s*(Number(p.value)||0)/100:Number(p.value)||0;if(p.maxDiscount)d=Math.min(d,Number(p.maxDiscount));return Math.min(s,Math.round(d))}
function validatePromo(p,phone){
 const now=new Date(), s=subtotal(), n=normalizePhone(phone);
 if(!p||p.active===false)return "Promo code is not active.";
 if(p.validFrom&&now<new Date(p.validFrom+"T00:00:00"))return "This promo has not started yet.";
 if(p.validUntil&&now>new Date(p.validUntil+"T23:59:59"))return "This promo has expired.";
 if(s<Number(p.minOrder||0))return `Minimum food order of ₹${p.minOrder} required.`;
 if(p.usageLimit&&Number(p.used||0)>=Number(p.usageLimit))return "This promo has reached its usage limit.";
 if(!n||n.length!==10)return "Enter a valid 10-digit mobile number before applying the promo.";
 if(p.audience==="new"){
   const existing=paidOrders().some(o=>normalizePhone(o.customerPhone)===n && (o.paymentStatus==="Verified"||o.orderStatus));
   if(existing)return "This offer is available for new customers only.";
 }
 if(p.audience==="special"){
   if(redemptions().some(r=>r.code===p.code&&r.phone===n))return "This special promo has already been used with this mobile number.";
 }
 return "";
}
function calc(){const s=subtotal(),d=applied?discountFor(applied,s):0,discounted=s-d,conv=Math.round(discounted*.03),h=orderType==="Delivery"?40:15;return{s,d,conv,h,total:discounted+conv+h}}
function render(){const t=calc();$("#sub").textContent=money(t.s);$("#discountRow").style.display=t.d?"flex":"none";$("#discount").textContent=`-${money(t.d)}`;$("#conv").textContent=money(t.conv);$("#handling").textContent=money(t.h);$("#handlingLabel").textContent=orderType==="Delivery"?"Delivery & Handling":"Packing & Disposables";$("#total").textContent=money(t.total)}
document.querySelectorAll(".type-btn[data-type]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".type-btn[data-type]").forEach(x=>x.classList.remove("active"));b.classList.add("active");orderType=b.dataset.type;$("#deliveryFields").classList.toggle("hidden",orderType!=="Delivery");render()});
$("#scheduleMode").onchange=e=>$("#scheduleFields").classList.toggle("hidden",e.target.value!=="later");
$("#applyPromo").onclick=()=>{const code=$("#promo").value.trim().toUpperCase(),p=promos().find(x=>x.code===code),msg=$("#promoMsg");const err=validatePromo(p,$("#phone").value);if(err){applied=null;msg.className="promo-msg promo-bad";msg.textContent=err;render();return}applied=p;msg.className="promo-msg promo-ok";msg.textContent=`${p.code} applied successfully.`;render()};
$("#pay").onclick=()=>{
 if(checkoutStoreSettings){const st=TDCBusinessHours.status(checkoutStoreSettings);if(!st.open){$("#err").textContent=st.message+". Online orders cannot be placed while the cafe is closed.";return}}
 $("#err").textContent="";if(!cart.length){location.href="cart.html";return}
 const name=$("#name").value.trim(),phone=normalizePhone($("#phone").value),address=$("#address").value.trim();
 if(!name)return $("#err").textContent="Please enter your name.";
 if(phone.length!==10)return $("#err").textContent="Please enter a valid 10-digit mobile number.";
 if(orderType==="Delivery"&&!address)return $("#err").textContent="Please enter your delivery address.";
 if(applied){const e=validatePromo(applied,phone);if(e){applied=null;render();return $("#err").textContent=e}}
 const mode=$("#scheduleMode").value,date=$("#date").value,time=$("#time").value;if(mode==="later"&&(!date||!time))return $("#err").textContent="Please select date and time.";
 const t=calc(), order={customerName:name,customerPhone:phone,orderType,scheduleText:mode==="asap"?"As soon as possible":`${date} at ${time}`,deliveryAddress:orderType==="Delivery"?address:"",landmark:$("#landmark").value.trim(),note:$("#note").value.trim(),items:cart.map(x=>({name:x.name,price:x.price,qty:x.qty,lineTotal:x.price*x.qty})),subtotal:t.s,promoCode:applied?.code||"",promoAudience:applied?.audience||"",promoDiscount:t.d,platformFee:t.conv,handlingFee:t.h,handlingLabel:orderType==="Delivery"?"Delivery & Handling":"Packing & Disposables",total:t.total,createdAt:new Date().toISOString()};
 localStorage.setItem("tdcPendingOrder",JSON.stringify(order));location.href="payment.html";
};
if(!cart.length)location.href="cart.html";render();


async function initCheckoutAvailability(){
  checkoutStoreSettings=await TDCBusinessHours.load();const st=TDCBusinessHours.status(checkoutStoreSettings),btn=$("#pay"),err=$("#err");
  if(!st.open){btn.disabled=true;btn.dataset.closed="1";err.textContent=st.message+". You can browse and prepare your cart, but ordering is available only during opening hours.";}
  else if(btn.dataset.closed==="1"){btn.disabled=false;delete btn.dataset.closed;err.textContent=""}
}
initCheckoutAvailability();setInterval(initCheckoutAvailability,30000);
