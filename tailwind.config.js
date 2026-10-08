/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    screens: {
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px'
    },
    extend: {
      colors: {
        brightPurple2: '#6f458d5d',
        lightPink2: '#bc89c3ff',
        darkPink: '#8100c7ff',
        darkBlue2: '#0b243cff',
        lightBlue2: '#1a3067ff',
        purple2: '#520272ff',
        darkPurple2: '#2e0464dd',
        green: '#2ECC40',
        grey2: '#2e2d2dcb',
        red2: '#902520ff',
      }
    },
  },
  plugins: [],
}
