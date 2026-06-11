/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#0D0D0D',
        darksurface: '#1A1A1A',
        primary: '#F5F0E8',
        accent: '#C8B8A2',
        highlight: '#E8FF00',
        muted: '#444444',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
