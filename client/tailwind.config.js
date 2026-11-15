/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#10223D', // Primary brand navy
          950: '#0A1526',
          900: '#10223D',     // Exact requested: #10223D
          800: '#182E50',
          700: '#203753',     // Secondary navy: #203753
          600: '#2B4A70',
          500: '#3A6293',
          100: '#E2E8F0',
          50: '#F0F4F8',
        },
        coral: {
          DEFAULT: '#FF806F', // Restrained Coral: #FF806F
          500: '#FF806F',
          600: '#FA6B59',
          700: '#E55644',
          50: '#FFF6F5',
          light: '#FFE5E1',
        },
        tekmira: {
          navy: '#10223D',
          secondaryNavy: '#203753',
          white: '#FFFFFF',
          light: '#F7F9FC',
          coral: '#FF806F',
          text: '#172033',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
