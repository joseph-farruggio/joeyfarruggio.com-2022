module.exports = {
  important: true,
  darkMode: 'class',
  content: [
    "./public/*.html",
    "./public/**/index.html",
    "./public/blog/*/*.html",

  ],
  theme: {
    fontFamily: {
      'body': ['Qucksand', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        darkBG:  '#040817',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
