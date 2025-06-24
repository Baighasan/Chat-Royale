/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#171717',
          secondary: '#262626',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
        },
        border: '#404040',
        accent: '#38bdf8',
        error: '#ef4444',
        user: '#0284c7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 