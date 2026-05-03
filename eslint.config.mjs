import withNuxt from './.nuxt/eslint.config.mjs';
import tseslint from 'typescript-eslint';

// Extract only the rules from the strict-type-checked-only preset,
// avoiding the plugin/parser registration that conflicts with @nuxt/eslint.
const strictRules = Object.assign(
  {},
  ...tseslint.configs.strictTypeCheckedOnly
    .filter((c) => c.rules)
    .map((c) => c.rules),
);

export default withNuxt(
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
    rules: {
      ...strictRules,
      'vue/html-self-closing': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
);
