const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // One brand colour for the whole app — change it here, not per component.
      colors: {
        brand: colors.emerald,
      },
      fontFamily: {
        logo: ['"Nunito"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
