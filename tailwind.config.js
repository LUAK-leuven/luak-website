/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      keyframes: {
        bounceInput: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        bounceInput: 'bounceInput 0.25s ease-in-out',
      },
    },
  },
  daisyui: {
    themes: ['nord', 'lemonade'],
  },
  plugins: [require('daisyui')],
};
