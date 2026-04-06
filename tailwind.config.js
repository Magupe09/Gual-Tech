/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#3E216B',
        'primary': '#532D8C',
        'accent': '#7B5CC9',
        'accent-light': '#9D8AD4',
        'surface': '#2D1647',
        'surface-light': '#4A3375',
      }
    },
  },
  plugins: [],
}
