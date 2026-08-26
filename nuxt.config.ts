import type { CompilerOptions } from 'typescript';

const tsCompilerOptions: CompilerOptions = {
  noFallthroughCasesInSwitch: true,
  exactOptionalPropertyTypes: true,
  noUncheckedSideEffectImports: true,
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
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@200..600,0..1&icon_names=arrow_back,arrow_forward,check,download,filter_alt,fullscreen,fullscreen_exit,info,more_vert,open_in_new,qr_code_scanner&display=block',
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
    dev: true,
  },
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirmLogin',
      include: ['/profile(/*)?'],
      exclude: ['/profile/overview'],
      saveRedirectToCookie: true,
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
    types: '~~/shared/types/database.types.ts',
  },
  typescript: {
    // typeCheck: true, // Would be nice if we could enable this, but right now there are too many import errors and I don't know how to fix them yet.
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
          '#test/*': ['../test/*', '../test/testUtils/*'],
        },
        ...tsCompilerOptions,
      },
      include: [
        '../test/**/*',
        '../content.config.ts',
        '../playwright.config.ts',
        '../vitest.config.ts',
      ],
    },
  },
});
