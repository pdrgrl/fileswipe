/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090b10',
        surface: '#111520',
        'surface-elevated': '#181e2e',
        'surface-glass': 'rgba(17, 21, 32, 0.75)',
        border: '#232b40',
        'border-subtle': '#1a2030',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        swipe: {
          keep: '#10b981',
          'keep-glow': 'rgba(16, 185, 129, 0.25)',
          delete: '#ef4444',
          'delete-glow': 'rgba(239, 68, 68, 0.25)',
          skip: '#f59e0b',
          'skip-glow': 'rgba(245, 158, 11, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 48px 0 rgba(0, 0, 0, 0.55)',
        'glow-keep': '0 0 35px rgba(16, 185, 129, 0.4)',
        'glow-delete': '0 0 35px rgba(239, 68, 68, 0.4)',
        'glow-skip': '0 0 35px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
