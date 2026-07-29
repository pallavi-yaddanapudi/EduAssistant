/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fe',
          100: '#e9edfd',
          200: '#d5dcfa',
          300: '#b2c0f6',
          400: '#879cf1',
          500: '#5871eb',
          600: '#3b51e0',
          700: '#2c3cc8',
          800: '#2330a1',
          900: '#17207c',
          950: '#0e124d',
        },
        slate: {
          950: '#060814', // Deep, premium rich black/slate
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 10px 0 rgba(31, 38, 135, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-glow': '0 0 25px 0 rgba(88, 113, 235, 0.15)',
        'purple-glow': '0 0 25px 0 rgba(147, 51, 234, 0.15)',
        'emerald-glow': '0 0 25px 0 rgba(16, 185, 129, 0.15)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
