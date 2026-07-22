"use strict";
const WHATSAPP_NUMBER = "919181333402";
const money = n => `₹${Number(n).toFixed(0)}`;
let order=null;
try { order=JSON.parse(localStorage.getItem("tdcPaidOrder") || "null"); } catch {}
const errorBox=document.querySelector("#paymentError");
if(!order){
  errorBox.textContent="No completed order was found on this device.";
  document.querySelector("#invoice").style.display="none";
  document.querySelector("#whatsappOrderBtn").style.display="none";
  document.querySelector("#printInvoiceBtn").style.display="none";
} else {
  const date = new Date(order.paidAt || Date.now());
  document.querySelector("#invoiceMeta").innerHTML=`<div><span>Invoice</span><strong>${order.invoiceNumber}</strong></div><div><span>Date</span><strong>${date.toLocaleString("en-IN")}</strong></div>`;
  document.querySelector("#invoiceCustomer").innerHTML=`<strong>Bill To</strong><span>${order.customerName}</span><span>${order.customerPhone}</span><span>${order.orderType} • ${order.scheduleText}</span>${order.deliveryAddress?`<span>${order.deliveryAddress}${order.landmark?`, ${order.landmark}`:""}</span>`:""}`;
  document.querySelector("#invoiceItems").innerHTML=order.items.map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.lineTotal)}</td></tr>`).join("");
  document.querySelector("#invoiceTotal").textContent=money(order.total ?? order.subtotal);
  document.querySelector("#invoicePayment").innerHTML=`<span>Subtotal: <strong>${money(order.subtotal)}</strong></span><span>${order.handlingLabel || (order.orderType === "Delivery" ? "Delivery & Handling" : "Packaging & Handling")}: <strong>${money(order.handlingFee || 0)}</strong></span><span>Payment method: <strong>Razorpay</strong></span><span>Payment status: <strong>Verified & Captured</strong></span><span>Payment ID: <strong>${order.paymentId}</strong></span>`;
  const msg=localStorage.getItem("tdcPaidOrderWhatsApp") || "";
  const whatsappUrl=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  document.querySelector("#whatsappOrderBtn").href=whatsappUrl;

  // Attempt to open the pre-filled WhatsApp order automatically after verified payment.
  // Browsers may block automatic new tabs, so the visible WhatsApp button remains as fallback.
  if(new URLSearchParams(location.search).get("paid") === "1"){
    setTimeout(()=>{
      const w = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if(!w) errorBox.textContent="Payment is successful. Tap ‘Send Paid Order on WhatsApp’ below to complete the order message.";
    }, 900);
    history.replaceState({}, "", "success.html");
  }
}
document.querySelector("#printInvoiceBtn").addEventListener("click",()=>window.print());
