/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#050811",
          900: "#090e1d",
          850: "#0d1428",
          800: "#121b36",
          700: "#1c2a4f",
          600: "#273b6e",
          500: "#385296"
        },
        sakura: {
          100: "#fff0f3",
          200: "#ffe3e8",
          300: "#ffd1dc",
          400: "#ffb7c5",
          500: "#ff7597",
          600: "#f43f75",
          700: "#be1248"
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Courier New', 'monospace'],
        sans: ['Consolas', 'Courier New', 'monospace']
      },
      boxShadow: {
        'sakura-glow': '0 0 20px rgba(255, 117, 151, 0.35)',
        'sakura-glow-lg': '0 0 35px rgba(255, 117, 151, 0.5)',
        'midnight-card': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'midnight-inset': 'inset 0 2px 8px rgba(0, 0, 0, 0.6)'
      }
    },
  },
  plugins: [],
}
