/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
      },
      // Dark mode optimized colors
      backgroundColor: {
        'dark': '#0f172a',
        'dark-card': '#1e293b',
        'dark-hover': '#334155',
      },
      textColor: {
        'dark': '#f1f5f9',
        'dark-secondary': '#cbd5e1',
      },
      borderColor: {
        'dark': '#334155',
      },
    },
  },
  plugins: [],
} 