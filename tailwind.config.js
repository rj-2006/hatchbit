/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'poke-primary': 'var(--poke-primary)',
        'poke-secondary': 'var(--poke-secondary)',
        'poke-bg': 'var(--poke-bg)',
        'poke-accent': 'var(--poke-accent)',
      },
    },
  },
}