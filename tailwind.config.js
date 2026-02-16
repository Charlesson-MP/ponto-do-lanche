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
  plugins: [],
}
