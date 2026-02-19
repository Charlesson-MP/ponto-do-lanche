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
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(198, 40, 40, 0.39)',
        'accent': '0 4px 14px 0 rgba(255, 193, 7, 0.39)',
        'brown': '0 4px 14px 0 rgba(93, 64, 55, 0.39)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'header': '0 4px 6px -1px rgba(93, 64, 55, 0.5), 0 2px 4px -1px rgba(93, 64, 55, 0.2)',
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
          textShadow: '1px 1px 1px #5D4037',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
