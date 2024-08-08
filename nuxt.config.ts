// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        "data-theme": "nord",
      },
      link: [{
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
      }],
    },
  },
  css: ["~/assets/css/main.css"],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/confirmLogin",
      include: ["/user(/*)?"],
      cookieRedirect: true,
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: "",
      paymentLinkMembership: "",
      paymentLinkMembershipDiscount: "",
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/supabase",
    "@vee-validate/nuxt",
    "@nuxt/eslint",
  ],
});
