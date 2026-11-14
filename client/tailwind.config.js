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
          950: '#060B18',
          900: '#0A142F', // Primary deep navy
          800: '#12224A',
          700: '#1E3A8A',
          600: '#2563EB',
          100: '#E0E7FF',
          50: '#F0F4FF'
        },
        coral: {
          500: '#FF6B6B', // Signature coral accent
          600: '#FA5252',
          700: '#E03131',
          50: '#FFF5F5',
          light: '#FFE3E3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
