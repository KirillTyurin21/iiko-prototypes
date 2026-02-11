/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          primary: '#1976D2',
          'primary-dark': '#1565C0',
          'primary-light': '#42A5F5',
          accent: '#FF6D00',
          'accent-light': '#FF9E40',
          danger: '#D32F2F',
          'danger-light': '#EF5350',
          success: '#388E3C',
          'success-light': '#66BB6A',
          warning: '#F57F17',
          'warning-light': '#FFB74D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EEEEEE',
          hover: '#E3F2FD',
          selected: '#BBDEFB',
        },
        border: {
          DEFAULT: '#E0E0E0',
          strong: '#BDBDBD',
          focus: '#1976D2',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          disabled: '#BDBDBD',
          inverse: '#FFFFFF',
        },
        sidebar: {
          bg: '#263238',
          hover: '#37474F',
          active: '#1976D2',
          text: '#ECEFF1',
          'text-muted': '#90A4AE',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['14px', '20px'],
        'lg': ['16px', '24px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'card-hover': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'modal': '0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14)',
        'dropdown': '0 2px 8px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
}
