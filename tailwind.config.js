/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'hmh-black':      '#0D0D0D',
        'hmh-gray':       '#1A1A1A',
        'hmh-gray-light': '#2A2A2A',
        'hmh-cream':      '#F5EDD6',
        'hmh-cream-dim':  '#B8A98A',
        'hmh-gold':       '#C9A23E',
        'hmh-gold-light': '#E8C96A',
        'hmh-red':        '#B91C1C',
        'hmh-blue':       '#1E3A8A',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
