// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'nord',
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
      include: ['/profile(/*)?', '/stories(/*)?', '/board(/*)?'],
      cookieRedirect: true,
    },
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
    markdown: {
      anchorLinks: false,
    },
  },
  sentry: {
    sourceMapsUploadOptions: {
      org: 'luak',
      project: 'luak-nuxt',
      authToken:
        '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',
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxthq/studio',
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@vee-validate/nuxt',
    '@nuxt/eslint',
    '@sentry/nuxt/module',
  ],
});
