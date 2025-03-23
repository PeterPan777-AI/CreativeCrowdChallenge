/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#F9FAFB',
        card: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB',
        individual: '#8B5CF6',
        business: '#F59E0B',
      },
    },
  },
  plugins: [],
}
