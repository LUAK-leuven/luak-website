import { stripe } from "../_shared/stripe.ts";
import { createClient } from "supabase";
import type { Database } from "../_shared/database.types.ts";

Deno.serve(async (req) => {
  const request_body = await req.json();
  const supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const has_membership = await supabaseClient.rpc("has_membership");

  if(has_membership == "no_membership"):
    supabaseClient.from('Memberships').insert({
      kbf_uiaa_member: request_body.kbf_uiaa_member,
      sportscard: request_body.sportscard,
      student: request_body.student,
    })
  else if(has_membership == "unpaid_membersip") continue;
  else if(has_membership == "paid_membership") return new Response("You already have a membership this year", {status: 400});
  else return Response.error()
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:4242/success",
    cancel_url: "http://localhost:4242/cancel",
  });

  if (!session.url) return Response.error();
  return Response.redirect(session.url, 303);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-checkout' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
