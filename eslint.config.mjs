// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/html-self-closing': 'off',
    // "vue/attribute-order": "off",
    'vue/no-multiple-template-root': 'off',
  },
});
// Your custom configs here
