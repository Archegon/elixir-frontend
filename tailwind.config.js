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
        'xs': '14px',      // was 12px (+2px) - Labels, badges, small details
        'sm': '16px',      // was 14px (+2px) - Secondary text, descriptions  
        'base': '18px',    // was 16px (+2px) - Body text
        'lg': '20px',      // was 18px (+2px) - Headings, important text
        'xl': '22px',      // was 20px (+2px) - Large headings
        '2xl': '26px',     // was 24px (+2px) - Display text, timers
        '3xl': '32px',     // was 30px (+2px) - Large displays
        '4xl': '38px',     // was 36px (+2px) - Extra large displays
        '5xl': '50px',     // was 48px (+2px) - Hero text
        '6xl': '62px',     // was 60px (+2px) - Extra hero text
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