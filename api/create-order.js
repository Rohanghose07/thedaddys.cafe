const MENU_PRICES = Object.freeze({
  "Daddy's Crispy Chicken Pakoda (10 Pcs)":130,
  "Classic Egg Devil (2 Pcs)":99,
  "Cheesy Chicken Balls (6 Pcs)":170,
  "Chilli Chicken":160,
  "Chicken 65":160,
  "Chilli Paneer":130,
  "Chilli Baby Corn":120,
  "Veg Fried Rice":70,
  "Egg Fried Rice":90,
  "Chicken Fried Rice":100,
  "Egg Chicken Fried Rice":120,
  "Baby Corn Fried Rice":90,
  "Veg Schezwan Fried Rice":90,
  "Egg Schezwan Fried Rice":110,
  "Chicken Schezwan Fried Rice":130,
  "Egg Chicken Schezwan Fried Rice":150,
  "Baby Corn Schezwan Fried Rice":110,
  "Veg Hakka Noodles":70,
  "Egg Hakka Noodles":90,
  "Chicken Hakka Noodles":100,
  "Egg Chicken Hakka Noodles":120,
  "Baby Corn Hakka Noodles":90,
  "Veg Schezwan Noodles":90,
  "Egg Schezwan Noodles":110,
  "Chicken Schezwan Noodles":130,
  "Egg Chicken Schezwan Noodles":150,
  "Baby Corn Schezwan Noodles":110,
  "Paneer Roll":80,
  "Egg Roll":70,
  "Chicken Roll":100,
  "Egg Chicken Roll":120,
  "Corn Sandwich":70,
  "Paneer Sandwich":90,
  "Corn & Paneer Sandwich":110,
  "Chicken Sandwich":130,
  "Chicken & Corn Sandwich":150,
  "Veg Momos (6 Pcs)":40,
  "Chicken Momos (6 Pcs)":60,
  "Veg Fried Momos (6 Pcs)":70,
  "Chicken Fried Momos (6 Pcs)":90,
  "Veg Pan Fried Momos (6 Pcs)":90,
  "Chicken Pan Fried Momos (6 Pcs)":110,
  "Fried Masala Maggi":50,
  "Cheesy Fried Masala Maggi":80,
  "Tawa Roti":10,
  "Butter Roti":15,
  "Paratha":30,
  "Masala Omelette (Double Egg)":60
});

function json(res, status, body){
  return res.status(status).json(body);
}

export default async function handler(req, res){
  if(req.method !== "POST") return json(res, 405, {error:"Method not allowed"});

  try {
    const {items, orderType, receipt, promoCode, promoDiscount} = req.body || {};
    if(!Array.isArray(items) || !items.length) return json(res, 400, {error:"Cart is empty."});
    if(orderType !== "Delivery" && orderType !== "Takeaway") return json(res, 400, {error:"Invalid order type."});

    let subtotal = 0;
    let totalQty = 0;
    for(const item of items){
      const price = MENU_PRICES[item?.name];
      const qty = Number(item?.qty);
      if(price == null || !Number.isInteger(qty) || qty < 1 || qty > 50){
        return json(res, 400, {error:"The cart contains an invalid item or quantity. Please refresh and try again."});
      }
      subtotal += price * qty;
      totalQty += qty;
    }
    if(totalQty > 100 || subtotal <= 0 || subtotal > 100000){
      return json(res, 400, {error:"Invalid cart total."});
    }

    const discount = Math.max(0, Math.min(subtotal, Math.round(Number(promoDiscount)||0)));
    const discountedSubtotal = subtotal - discount;
    const platformFee = Math.round(discountedSubtotal * 0.03);
    const handlingFee = orderType === "Delivery" ? 40 : 15;
    const total = discountedSubtotal + platformFee + handlingFee;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if(!keyId || !keySecret) return json(res, 500, {error:"Payment service is not configured."});

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rp = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST",
      headers:{Authorization:`Basic ${auth}`, "Content-Type":"application/json"},
      body:JSON.stringify({
        amount: total * 100,
        currency:"INR",
        receipt: String(receipt || `TDC-${Date.now()}`).slice(0,40),
        notes:{order_type:orderType, subtotal:String(subtotal), promo_code:String(promoCode||""), promo_discount:String(discount), convenience_fee:String(platformFee), handling_fee:String(handlingFee)}
      })
    });
    const data = await rp.json().catch(()=>({}));
    if(!rp.ok) return json(res, rp.status, {error:data?.error?.description || "Unable to create Razorpay order."});

    return json(res, 200, {
      orderId:data.id,
      amount:data.amount,
      currency:data.currency,
      keyId,
      subtotal,
      promoDiscount:discount,
      platformFee,
      handlingFee,
      total
    });
  } catch(error){
    console.error("create-order error", error);
    return json(res, 500, {error:"Unable to create payment order. Please try again."});
  }
}
