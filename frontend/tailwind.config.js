/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444",
      }
    },
  },
  plugins: [],
}
