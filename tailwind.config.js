/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom spacing for better layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Custom fonts for readability
      fontFamily: {
        'medical': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },

      // Global font size increases for better readability on 1280x720 screens
      fontSize: {
        'xs': '16px',      // was 14px (+2px more) - Labels, badges, small details
        'sm': '18px',      // was 16px (+2px more) - Secondary text, descriptions  
        'base': '20px',    // was 18px (+2px more) - Body text
        'lg': '22px',      // was 20px (+2px more) - Headings, important text
        'xl': '24px',      // was 22px (+2px more) - Large headings
        '2xl': '28px',     // was 26px (+2px more) - Display text, timers
        '3xl': '34px',     // was 32px (+2px more) - Large displays
        '4xl': '40px',     // was 38px (+2px more) - Extra large displays
        '5xl': '52px',     // was 50px (+2px more) - Hero text
        '6xl': '64px',     // was 62px (+2px more) - Extra hero text
      },
      
      // Custom shadows for depth
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
} 