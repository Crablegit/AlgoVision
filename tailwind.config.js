/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#e0e5ec",
          darkBg: "#1a1d24",
          surface: "#e8edf5",
          accent: "#3b82f6",
          accentHover: "#2563eb",
          text: "#374151",
          subtext: "#6b7280",
          highlight: "#10b981",
          comparing: "#f59e0b",
          swapping: "#ef4444"
        }
      },
      boxShadow: {
        'neu-flat': '7px 7px 15px #b8b9be, -7px -7px 15px #ffffff',
        'neu-flat-sm': '4px 4px 8px #b8b9be, -4px -4px 8px #ffffff',
        'neu-flat-lg': '12px 12px 24px #b8b9be, -12px -12px 24px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff',
        'neu-pressed-sm': 'inset 2px 2px 5px #b8b9be, inset -2px -2px 5px #ffffff',
        'neu-active': 'inset 3px 3px 6px #b8b9be, inset -3px -3px 6px #ffffff',
        'neu-glow': '0 0 15px rgba(59, 130, 246, 0.5), 5px 5px 12px #b8b9be, -5px -5px 12px #ffffff'
      },
      borderRadius: {
        'neu': '1.25rem',
      }
    },
  },
  plugins: [],
}
