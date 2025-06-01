/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // enable class based dark mode (tells tail wind to apply dark mode styles whne we manually add a dark class in root element )
  theme: {
    extend: {},
  },
  plugins: [],
}

