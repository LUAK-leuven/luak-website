// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  compatibilityDate: '2026-01-25',
  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'nord',
        lang: 'en',
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        },
      ],
    },
  },
  css: ['~/assets/css/main.scss'],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirmLogin',
      include: ['/profile(/*)?'],
      saveRedirectToCookie: true,
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
    types: '~/types/database.types.ts',
  },
  runtimeConfig: {
    public: {
      baseUrl: '',
      paymentLinkMembership: 'https://buy.stripe.com/9AQaGj7K1eso4KsfYZ',
      paymentLinkMembershipDiscount:
        'https://buy.stripe.com/4gwbKnfctdokdgYcMM',
    },
  },
  content: {
    renderer: {
      anchorLinks: false,
    },
  },
  studio: {
    // Studio admin route (default: '/_studio')
    route: '/_studio',

    // Git repository configuration
    repository: {
      provider: 'github',
      owner: 'LUAK-leuven',
      repo: 'luak-website',
      branch: 'studio',
      private: true,
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@vee-validate/nuxt',
    '@nuxt/eslint',
    'nuxt-studio',
    'nuxt-typed-router',
  ],
  // vite: {
  //   optimizeDeps: {
  //     // TODO: This is a workaround for the issue where the cookie package is not being bundled correctly by Vite, due to a bug in @supabase/ssr (comig with @supabase/supabase-js).
  //     include: ['@supabase/ssr', '@supabase/supabase-js', 'cookie'],
  //     holdUntilCrawlEnd: true, // explicit — block requests until crawl done
  //   },
  // },
});
