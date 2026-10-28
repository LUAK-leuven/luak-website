import withNuxt from './.nuxt/eslint.config.mjs';
import tseslint from 'typescript-eslint';

// Extract only the rules from the strict-type-checked-only preset,
// avoiding the plugin/parser registration that conflicts with @nuxt/eslint.
const strictRules = Object.assign(
  {},
  ...tseslint.configs.strictTypeChecked.flatMap((c) => c.rules ?? []),
);

export default withNuxt(
  {
    ignores: [
      'supabase/**',
      '**/database.types.ts',
      'node_modules/**',
      '.opencode/**',
      'playwright-report/**',
      'test-results/**',
      '.nuxt/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      ...strictRules,
      'vue/html-self-closing': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
    },
  },
);
