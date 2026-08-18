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
        background: '#08090d',
        'background-alt': '#0d0f17',
        surface: '#11141d',
        'surface-elevated': '#161b26',
        'surface-glass': 'rgba(17, 20, 29, 0.75)',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-subtle': 'rgba(255, 255, 255, 0.04)',
        'border-highlight': 'rgba(255, 255, 255, 0.16)',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.25)'
        },
        swipe: {
          keep: '#10b981',
          'keep-glow': 'rgba(16, 185, 129, 0.3)',
          'keep-bg': 'rgba(16, 185, 129, 0.1)',
          delete: '#f43f5e',
          'delete-glow': 'rgba(244, 63, 94, 0.3)',
          'delete-bg': 'rgba(244, 63, 94, 0.1)',
          skip: '#f59e0b',
          'skip-glow': 'rgba(245, 158, 11, 0.3)',
          'skip-bg': 'rgba(245, 158, 11, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      boxShadow: {
        'raycast-card': '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'raycast-dock': '0 1px 0 0 rgba(255, 255, 255, 0.12) inset, 0 16px 32px -8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'raycast-button': '0 1px 0 0 rgba(255, 255, 255, 0.15) inset, 0 4px 12px rgba(0, 0, 0, 0.4)',
        'glow-keep': '0 0 30px rgba(16, 185, 129, 0.35)',
        'glow-delete': '0 0 30px rgba(244, 63, 94, 0.35)',
        'glow-skip': '0 0 30px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
