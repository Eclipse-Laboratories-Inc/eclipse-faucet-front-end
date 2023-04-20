/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        IBM_Mono: ['var(--font-IBM-Mono)'],
      },
    },
  },
  plugins: [],
}
