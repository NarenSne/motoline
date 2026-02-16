/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6600",
        "primary-dark": "#e65c00",
        "background-light": "#f3f4f6",
        "background-dark": "#121212",
        "surface-dark": "#1e1e1e",
        "surface-light": "#ffffff",
        "text-light": "#1f2937",
        "text-dark": "#e5e7eb",
        "accent-gray": "#333333",
        "border-dark": "#2d2d2d",
        "border-light": "#e5e7eb"
      },
      fontFamily: {
        display: ["Teko", "sans-serif"], // Note: Font family might need import in styles.css if not already present
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
