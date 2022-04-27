const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  important: true,
  darkMode: "class",
  content: [
    "./src/*.njk",
    "./src/_includes/*.njk",
    "./src/_includes/layouts/*.njk",
    "./src/blog/*.md",
  ],
  theme: {
    fontFamily: {
      body: ["Qucksand", "Helvetica", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        darkBG: "#040817",
      },

      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.slate.500"),
            a: {
              color: theme("colors.orange.400"),
              "&:hover": {
                color: theme("colors.gray.900"),
              },
            },

            img: {
              // borderRadius: defaultTheme('borderRadius.length'),
              // shadow: defaultTheme('shadow.lg'),
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.white"),
            a: {
              color: theme("colors.orange.400"),
              "&:hover": {
                color: theme("colors.white"),
              },
            },
            p: {
              fontSize: theme("fontSize.xs"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
