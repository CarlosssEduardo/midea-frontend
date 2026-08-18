/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midea-azul': '#00A0E3',
        'estrela-amarelo': '#FFD100',
      }
    },
  },
  plugins: [],
}