/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          subtle: "var(--color-accent-subtle)",
          border: "var(--color-accent-border)",
        },
        electric: {
          DEFAULT: "var(--color-electric)",
          hover: "var(--color-electric-hover)",
          subtle: "var(--color-electric-subtle)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Outfit", "sans-serif"],
        body: ["var(--font-primary)", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
