/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // User-selected Premium Espresso Brown & Antique Gold Dark Palette
        // #140E0A (Base), #261A13 (Surface), #4E3424 (Border), #A88462 (Mocha Tan), #D9C7A3 (Champagne), #B08D57 (Gold Accent)
        theme: {
          base: "#140E0A",       // Deep Espresso Dark Brown Base
          surface: "#261A13",    // Dark Chocolate Brown Surface
          elevated: "#382419",   // Elevated Chestnut Brown
          border: "#4E3424",     // Rich Warm Brown Border
          accent: "#B08D57",     // Antique Gold / Bronze Accent
          secondary: "#A88462",  // Warm Mocha Tan
          cream: "#D9C7A3",      // Champagne Ivory Cream
          light: "#F5EFE1",      // Bright Ivory Parchment
          charcoal: "#4E3424",   // Muted border / divider
          muted: "#A88462",      // Secondary readable text
        },
        // Keep claude aliases mapped to new theme
        claude: {
          bg: "#140E0A",
          card: "#261A13",
          elevated: "#382419",
          sidebar: "#1B120D",
          border: "#4E3424",
          borderDark: "#6B4731",
          primary: "#B08D57",
          primaryHover: "#C5A065",
          primaryDark: "#8C6E3D",
          text: "#D9C7A3",
          muted: "#A88462",
          dim: "#4E3424",
        }
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "Cambria", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}
