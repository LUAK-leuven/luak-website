import Stripe from "stripe";

export const stripe = new Stripe(
  Deno.env.get("STRIPE_API_KEY") as string,
  {
    apiVersion: "2024-04-10",
    httpClient: Stripe.createFetchHttpClient(),
  },
);

// This is needed in order to use the Web Crypto API in Deno.
export const cryptoProvider = Stripe.createSubtleCryptoProvider();
