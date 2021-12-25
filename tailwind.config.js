module.exports = {
  important: true,
  content: [
    "./public/*.html",
    "./public/**/index.html",
    "./public/blog/*/*.html",

  ],
  theme: {
    fontFamily: {
      'body': ['Qucksand', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
