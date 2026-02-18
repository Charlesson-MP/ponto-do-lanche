/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C62828",
        "primary-dark": "#8E0000",
        accent: "#FFC107",
        "accent-light": "#FFD54F",
        "accent-dark": "#D99100",
        brown: "#5D4037",
        "bg-hero": "#FCEFE4"
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.10)',
        },
        '.text-shadow-md': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        },
        '.text-shadow-lg': {
          textShadow: '0 8px 16px rgba(0, 0, 0, 0.20)',
        },
        '.text-shadow-brown': {
          textShadow: '2px 2px 2px #5D4037',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
