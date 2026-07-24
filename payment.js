"use strict";

const WHATSAPP_NUMBER = "919181333402";
const money = n => `₹${Number(n).toFixed(0)}`;

function getPendingOrder(){
  try { return JSON.parse(localStorage.getItem("tdcPendingOrder") || "null"); }
  catch { return null; }
}

const order = getPendingOrder();
const errorBox = document.querySelector("#paymentError");
const payBtn = document.querySelector("#razorpayPayBtn");
let paymentStoreSettings=null;

function showError(message){
  errorBox.textContent = message || "Unable to start payment. Please try again.";
}

if(!order || !Array.isArray(order.items) || !order.items.length || !Number.isFinite(Number(order.total ?? order.subtotal))){
  showError("No active order was found. Please return to the menu and create your order again.");
  payBtn.disabled = true;
} else {
  document.querySelector("#payableAmount").textContent = money(order.total ?? order.subtotal);
}

function createInvoiceNumber(){
  const d = new Date();
  const stamp = [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("");
  const suffix = Math.random().toString(36).slice(2,7).toUpperCase();
  return `TDC-${stamp}-${suffix}`;
}

function buildWhatsAppMessage(paidOrder){
  const items = paidOrder.items.map((x,i)=>`${i+1}. ${x.name} × ${x.qty} — ₹${x.lineTotal}`).join("\n");
  return `*PAID ORDER — ${paidOrder.invoiceNumber}*\n\n*Customer:* ${paidOrder.customerName}\n*Phone:* ${paidOrder.customerPhone}\n*Order Type:* ${paidOrder.orderType}\n*Preferred Time:* ${paidOrder.scheduleText}${paidOrder.orderType === "Delivery" ? `\n*Delivery Address:* ${paidOrder.deliveryAddress}${paidOrder.landmark ? `\n*Landmark:* ${paidOrder.landmark}` : ""}` : ""}\n\n*ORDER ITEMS*\n${items}\n\n*Subtotal:* ₹${paidOrder.subtotal}\n*Convenience Fee (3%):* ₹${paidOrder.platformFee || 0}\n*${paidOrder.handlingLabel || (paidOrder.orderType === "Delivery" ? "Delivery & Handling" : "Packing & Disposables")}:* ₹${paidOrder.handlingFee || 0}\n*Total Paid:* ₹${paidOrder.total ?? paidOrder.subtotal}\n*Payment:* Razorpay\n*Razorpay Payment ID:* ${paidOrder.paymentId}${paidOrder.note ? `\n\n*Special Instructions:* ${paidOrder.note}` : ""}\n\nPayment verified. Please confirm this order.`;
}

async function createRazorpayOrder(){
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      items: order.items.map(x => ({name:x.name, qty:x.qty})),
      orderType: order.orderType,
      receipt: `TDC-${Date.now()}`,
      promoCode: order.promoCode || "",
      promoDiscount: Number(order.promoDiscount || 0)
    })
  });
  const data = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || "Unable to create payment order.");
  return data;
}

async function verifyPayment(payload, expectedOrderId){
  const response = await fetch("/api/verify-payment", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      order_id: expectedOrderId,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature
    })
  });
  const data = await response.json().catch(()=>({}));
  if(!response.ok || !data.verified) throw new Error(data.error || "Payment could not be verified.");
  return data;
}

payBtn.addEventListener("click", async () => {
  if(!order) return;
  if(paymentStoreSettings){const st=TDCBusinessHours.status(paymentStoreSettings);if(!st.open){showError(st.message+". Online payment and ordering are disabled while the cafe is closed.");return}}
  errorBox.textContent = "";
  payBtn.disabled = true;
  const original = payBtn.querySelector("span").textContent;
  payBtn.querySelector("span").textContent = "Preparing secure payment…";

  try {
    if(typeof Razorpay === "undefined") throw new Error("Razorpay Checkout could not load. Check your internet connection and try again.");

    const created = await createRazorpayOrder();

    // Use the server-calculated amount as the source of truth.
    order.subtotal = Number(created.subtotal);
    order.promoDiscount = Number(created.promoDiscount || order.promoDiscount || 0);
    order.platformFee = Number(created.platformFee || 0);
    order.handlingFee = Number(created.handlingFee);
    order.total = Number(created.total);
    document.querySelector("#payableAmount").textContent = money(order.total);
    localStorage.setItem("tdcPendingOrder", JSON.stringify(order));

    const options = {
      key: created.keyId,
      amount: created.amount,
      currency: created.currency || "INR",
      name: "The Daddy's Cafe",
      description: `${order.orderType} Order`,
      image: `${window.location.origin}/assets/logo.png`,
      order_id: created.orderId,
      prefill: {
        name: order.customerName || "",
        contact: (order.customerPhone || "").replace(/\D/g, "")
      },
      notes: {
        order_type: order.orderType,
        preferred_time: order.scheduleText
      },
      theme: { color: "#f59e0b" },
      modal: {
        ondismiss: function(){
          payBtn.disabled = false;
          payBtn.querySelector("span").textContent = original;
        }
      },
      handler: async function(response){
        payBtn.querySelector("span").textContent = "Verifying payment…";
        try {
          const verified = await verifyPayment(response, created.orderId);
          const paidOrder = {
            ...order,
            invoiceNumber: createInvoiceNumber(),
            paymentMethod: "Razorpay",
            paymentStatus: "Verified",
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: created.orderId,
            paidAt: new Date().toISOString()
          };
          const msg = buildWhatsAppMessage(paidOrder);
          localStorage.setItem("tdcPaidOrder", JSON.stringify(paidOrder));
          localStorage.setItem("tdcPaidOrderWhatsApp", msg);
          // Phase 2 local admin mirror. Production multi-device sync requires a shared database.
          const orders = JSON.parse(localStorage.getItem("tdcAdminOrders") || "[]");
          orders.unshift({...paidOrder, orderStatus:"Paid"});
          localStorage.setItem("tdcAdminOrders", JSON.stringify(orders.slice(0,500)));
          // Sync the verified order/customer to the shared cloud database.
          try {
            const syncResponse = await fetch("/api/save-order", {
              method: "POST", headers: {"Content-Type":"application/json"},
              body: JSON.stringify(paidOrder)
            });
            if (!syncResponse.ok) console.warn("Cloud order sync deferred", await syncResponse.text());
          } catch (syncError) { console.warn("Cloud order sync unavailable", syncError); }
          if(paidOrder.promoCode){
            const promos=JSON.parse(localStorage.getItem("tdcPromos")||"[]");
            const p=promos.find(x=>x.code===paidOrder.promoCode);
            if(p){p.used=Number(p.used||0)+1;localStorage.setItem("tdcPromos",JSON.stringify(promos))}
            if(paidOrder.promoAudience==="special"||paidOrder.promoAudience==="new"){
              const reds=JSON.parse(localStorage.getItem("tdcPromoRedemptions")||"[]");
              reds.push({code:paidOrder.promoCode,phone:(paidOrder.customerPhone||"").replace(/\D/g,"").slice(-10),at:new Date().toISOString()});
              localStorage.setItem("tdcPromoRedemptions",JSON.stringify(reds));
            }
          }
          const overrides = JSON.parse(localStorage.getItem("tdcCatalogOverrides") || "{}");
          paidOrder.items.forEach(item => {
            const current = overrides[item.name] || {};
            if(Number.isFinite(Number(current.stock)) && Number(current.stock) < 999){
              current.stock = Math.max(0, Number(current.stock) - Number(item.qty));
              if(current.stock === 0) current.available = false;
              overrides[item.name] = current;
            }
          });
          localStorage.setItem("tdcCatalogOverrides", JSON.stringify(overrides));
          localStorage.removeItem("tdcPendingOrder");
          localStorage.removeItem("tdcCart");
          window.location.href = "success.html?paid=1";
        } catch(err){
          showError(err.message + " Do not place the order again if money was debited; contact The Daddy's Cafe with your payment ID.");
          payBtn.disabled = false;
          payBtn.querySelector("span").textContent = original;
        }
      }
    };

    const checkout = new Razorpay(options);
    checkout.on("payment.failed", function(response){
      const description = response?.error?.description || "Payment failed or was cancelled.";
      showError(description + " No order has been placed.");
      payBtn.disabled = false;
      payBtn.querySelector("span").textContent = original;
    });
    checkout.open();
  } catch(err){
    showError(err.message);
    payBtn.disabled = false;
    payBtn.querySelector("span").textContent = original;
  }
});


(async function initPaymentAvailability(){
  paymentStoreSettings=await TDCBusinessHours.load();const st=TDCBusinessHours.status(paymentStoreSettings);
  if(!st.open){payBtn.disabled=true;showError(st.message+". Online payment and ordering are available only during opening hours.");}
})();
