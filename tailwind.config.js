const preset = require('@tailwindcss/preset')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset()],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
}
