/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    screens: {
      'sm': '480px',  
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px'
    },
    extend: {
      colors:{
        brightPurple2: '#6f458d5d',
        lightPink2: '#bc89c3ff',
        darkPink: '#8100c7ff',
        darkBlue2: '#0b243cff',
        lightBlue2: '#1a3067ff',
        purple2: '#520272ff',
        darkPurple2: '#2e0464dd',
        green: '#2ECC40',
        grey2: '#2e2d2dcb',
        red2:'#902520ff',
      },
      spacing: {
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '7': '1.75rem',  // 28px
        '8': '2rem',     // 32px
        '9': '2.25rem',
        '10': '2.5rem'
      } 
    },
  },
  plugins: [],
}

