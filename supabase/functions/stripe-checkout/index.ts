import { stripe } from "../_shared/stripe.ts";
import { createClient } from "supabase";
import type { Database } from "../_shared/database.types.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const request_body = await req.json();
    const supabaseClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );
    const has_membership = (await supabaseClient.rpc("has_membership")).data;
    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log(has_membership);
    let membership;
    if (has_membership == "no_membership") {
      // add membership
      const { data, error } = await supabaseClient.from("Memberships").insert({
        kbf_uiaa_member: request_body.kbf_uiaa_member,
        sportscard: request_body.sportscard,
        student: request_body.student,
      }).select().single();
      if (error) throw new Error(error.message);
      membership = data;
    } else if (has_membership == "unpaid_membership") {
      // update membership
      const luak_year = (await supabaseClient.rpc("get_luak_year")).data;
      if (!luak_year || !user) throw new Error();

      const { data: unpaid_membersip } = await supabaseClient.from(
        "Memberships",
      )
        .select(
          "id",
        ).eq("year", luak_year).eq(
          "user_id",
          user.id,
        ).single();
      if (!unpaid_membersip) throw new Error();

      const { data, error } = await supabaseClient.from("Memberships").update({
        kbf_uiaa_member: request_body.kbf_uiaa_member,
        sportscard: request_body.sportscard,
        student: request_body.student,
      }).eq("id", unpaid_membersip.id).select().single();
      if (error) throw new Error(error.message);
      membership = data;
    } else if (has_membership == "paid_membership") {
      return new Response("You already have a membership this year", {
        status: 400,
        headers: corsHeaders,
      });
    } else throw new Error("has_membership returning unknown value");

    if (!membership) throw new Error("No membership");
    const has_discount = membership.kbf_uiaa_member === "kbf_luak";
    const session = await stripe.checkout.sessions.create({
      client_reference_id: membership.id,
      customer_email: user?.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: has_discount
                ? "LUAK membership (discount)"
                : "LUAK membership",
            },
            unit_amount: has_discount ? 1500 : 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:4242/success",
      cancel_url: "http://localhost:4242/cancel",
    });

    if (!session.url) throw new Error("No URL in stripe checkout session");
    return new Response(JSON.stringify({ payment_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error, { headers: corsHeaders, status: 500 });
  }
});
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-checkout' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
