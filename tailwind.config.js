/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        IBM_Mono: ['var(--font-IBM-Mono)'],
      },
      colors: {
        'custom-green': '#7B9E8B',
        'custom-blue': '#7282BC',
        'custom-yellow': '#FFB036',
        'custom-orange': '#FF7A00',
      },
      fontFamily: {
        abc: ['ABCMonumentGrotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
