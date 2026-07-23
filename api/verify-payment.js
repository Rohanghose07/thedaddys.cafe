import crypto from "crypto";

function json(res, status, body){
  return res.status(status).json(body);
}

export default async function handler(req, res){
  if(req.method !== "POST") return json(res, 405, {error:"Method not allowed"});

  try {
    const {order_id, razorpay_payment_id, razorpay_signature} = req.body || {};
    if(!order_id || !razorpay_payment_id || !razorpay_signature){
      return json(res, 400, {verified:false, error:"Missing payment verification details."});
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if(!keyId || !keySecret) return json(res, 500, {verified:false, error:"Payment service is not configured."});

    const expected = crypto.createHmac("sha256", keySecret)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(String(razorpay_signature), "utf8");
    if(expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)){
      return json(res, 400, {verified:false, error:"Payment signature verification failed."});
    }

    // Confirm the payment with Razorpay's API as an additional server-side check.
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers:{Authorization:`Basic ${auth}`}
    });
    const payment = await paymentRes.json().catch(()=>({}));
    if(!paymentRes.ok) return json(res, 502, {verified:false, error:"Could not confirm payment status with Razorpay."});
    if(payment.order_id !== order_id) return json(res, 400, {verified:false, error:"Payment does not match this order."});
    if(payment.status !== "captured"){
      return json(res, 409, {verified:false, error:`Payment is ${payment.status || "not captured"}. The order cannot be confirmed yet.`});
    }

    return json(res, 200, {
      verified:true,
      paymentId:razorpay_payment_id,
      orderId:order_id,
      status:payment.status,
      amount:payment.amount,
      method:payment.method || "Razorpay"
    });
  } catch(error){
    console.error("verify-payment error", error);
    return json(res, 500, {verified:false, error:"Payment verification failed. Please contact the cafe if money was debited."});
  }
}
