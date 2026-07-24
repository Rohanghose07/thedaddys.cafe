function json(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return json(res, 503, { error: 'Supabase cloud sync is not configured' });
  }

  const o = req.body || {};

  if (!o.id || !Array.isArray(o.items) || !o.items.length) {
    return json(res, 400, { error: 'Invalid POS order' });
  }

  const phone = String(o.phone || '')
    .replace(/\D/g, '')
    .slice(-10);

  const invoice = `POS-${String(o.id)}`;

  const payload = {
    // Supports your older existing orders schema too
    order_id: invoice,
    invoice_number: invoice,

    customer_name: String(o.customer || ''),
    customer_phone: phone,

    order_type: String(o.type || 'POS'),
    items: o.items,

    subtotal: Number(o.subtotal || 0),
    discount: Number(o.discount || 0),
    handling_fee:
      Number(o.delivery || 0) +
      Number(o.packing || 0),

    total: Number(o.total || 0),

    payment_method: String(o.payment || ''),
    payment_status: 'Recorded',

    channel: 'POS',
    order_status: String(o.status || 'Completed'),

    created_at: o.date || new Date().toISOString(),
    paid_at: o.date || new Date().toISOString()
  };

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  try {
    const orderResponse = await fetch(
      `${url}/rest/v1/orders`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }
    );

    const orderText = await orderResponse.text();

    if (!orderResponse.ok) {
      console.error('POS order sync error:', orderText);

      return json(res, 500, {
        error: 'Order sync failed',
        details: orderText
      });
    }

    // Update customer CRM if phone number exists
    if (phone) {
      const existingResponse = await fetch(
        `${url}/rest/v1/customers?phone=eq.${encodeURIComponent(phone)}&select=*`,
        { headers }
      );

      let existing = null;

      if (existingResponse.ok) {
        const rows = await existingResponse.json();
        existing = rows[0] || null;
      }

      const customerPayload = {
        phone,
        name: String(o.customer || existing?.name || ''),
        address: String(existing?.address || ''),
        order_count: Number(existing?.order_count || 0) + 1,
        total_spend:
          Number(existing?.total_spend || 0) +
          Number(o.total || 0),
        last_order_at: o.date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const customerResponse = await fetch(
        `${url}/rest/v1/customers?on_conflict=phone`,
        {
          method: 'POST',
          headers: {
            ...headers,
            Prefer: 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify(customerPayload)
        }
      );

      if (!customerResponse.ok) {
        console.error(
          'Customer sync error:',
          await customerResponse.text()
        );
      }
    }

    return json(res, 200, {
      ok: true,
      invoice
    });

  } catch (error) {
    console.error('POS cloud sync exception:', error);

    return json(res, 500, {
      error: error.message || 'POS cloud sync failed'
    });
  }
}
