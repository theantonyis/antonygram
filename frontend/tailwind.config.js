module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sf: ['"SF Pro Display"', 'sans-serif'], // Add SF Pro Display here
      },
    },
  },
  plugins: [],
}
