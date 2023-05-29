/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'web/**/*.{html,js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
