// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    public: {
      baseUrl: "",
      supabaseUrl: "",
      supabaseKey: "",
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
