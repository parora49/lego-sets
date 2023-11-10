/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.ejs`],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["valentine"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
