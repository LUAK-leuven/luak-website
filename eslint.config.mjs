import withNuxt from './.nuxt/eslint.config.mjs';
import tseslint from 'typescript-eslint';

export default withNuxt(tseslint.configs.strictTypeCheckedOnly, {
  rules: {
    'vue/html-self-closing': 'off',
    // "vue/attribute-order": "off",
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    ...tseslint.configs.strictTypeChecked
      .filter((c) => c.rules)
      .map((c) => c.rules),
    // ...tseslint.configs.strictTypeCheckedOnly
    //   .filter((c) => c.rules)
    //   .map((c) => c.rules),
  },
});
