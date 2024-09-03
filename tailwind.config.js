/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}","./screens/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'sm': '320px',   // small phones (iPhone SE)
        'md': '375px',   // medium phones (iPhone X)
        'lg': '425px',   // large phones (iPhone 11 Pro Max)
        'xl': '768px',   // tablets (iPad Mini)
        '2xl': '1024px', // larger tablets
      },
      fontFamily: {
        'poppins-thin': ['Poppins-Thin', 'sans-serif'],
        'poppins-extralight': ['Poppins-ExtraLight', 'sans-serif'],
        'poppins-semibold': ['Poppins-SemiBold', 'sans-serif'],
      },

    },
  },
  plugins: [],
}

