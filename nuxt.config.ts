import type { CompilerOptions } from 'typescript';

const tsCompilerOptions: CompilerOptions = {
  noFallthroughCasesInSwitch: true,
  exactOptionalPropertyTypes: true,
};

export default defineNuxtConfig({
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
  compatibilityDate: '2026-01-25',
  content: {
    renderer: {
      anchorLinks: false,
    },
  },
  css: ['~/assets/css/main.scss'],
  devtools: { enabled: true },
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
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: tsCompilerOptions,
      },
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
    types: '~~/shared/types/database.types.ts',
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: tsCompilerOptions,
    },
    sharedTsConfig: {
      compilerOptions: tsCompilerOptions,
    },
    nodeTsConfig: {
      compilerOptions: {
        paths: {
          '~/*': ['../*'],
          '#test/*': ['../test/*'],
        },
        ...tsCompilerOptions,
      },
      include: ['../test/**/*'],
    },
  },
});
