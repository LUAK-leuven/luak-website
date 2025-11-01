import { cryptoProvider, stripe } from '../_shared/stripe.ts';
import { createClient } from 'supabase';
import type { Database } from '../_shared/database.types.ts';

Deno.serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature');

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`);
  if (
    receivedEvent.type === 'checkout.session.completed' ||
    receivedEvent.type === 'checkout.session.async_payment_succeeded'
  ) {
    fulfillCheckout(receivedEvent.data.object.id);
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});

async function fulfillCheckout(sessionId: string) {
  console.log('Fulfilling Checkout Session ' + sessionId);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or Service Key');
  }
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (checkoutSession.payment_status !== 'unpaid') {
    const { error } = await supabase.from('Payments').insert({
      id: checkoutSession.id,
      amount: checkoutSession.amount_subtotal,
      membership_id: checkoutSession.client_reference_id,
      approved: true,
    });
    if (error) {
      throw error;
    }
  }
}
