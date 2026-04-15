import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    dir: 'tests/unit',
    exclude: ['node_modules/**', '.nuxt/**']
  },
});
