module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: [
    "./src/*.njk",
    "./src/_includes/*.njk",
    "./src/_includes/layouts/*.njk",

  ],
  theme: {
    fontFamily: {
      'body': ['Qucksand', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {

      colors: {
        darkBG: '#040817',
      },

    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
