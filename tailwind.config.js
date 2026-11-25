/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          950: '#060a0f',
          900: '#0c131c',
          850: '#111a26',
          800: '#172334',
          700: '#23354d',
          600: '#344c6d',
          500: '#486894',
        },
        defence: {
          cyan: '#00f0ff',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
