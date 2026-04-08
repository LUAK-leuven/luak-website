import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/html-self-closing': 'off',
    // "vue/attribute-order": "off",
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
  },
});
