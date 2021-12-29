module.exports = {
  important: true,
  mode: 'jit',
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
