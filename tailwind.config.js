/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['nord', 'lemonade'],
  },
  plugins: [require('daisyui')],
};
