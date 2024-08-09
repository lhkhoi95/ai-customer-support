/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chat-purple': '#8e44ad',
        'chat-gray': '#f0f0f0',
      },
      borderRadius: {
        'chat': '20px',
      },
    },
  },
  plugins: [],
}
