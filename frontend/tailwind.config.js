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
        // High-Fashion Obsidian & Juicy Sunset Orange (#171717 and #f2572b)
        theme: {
          base: "#171717",       // Deep Matte Obsidian Dark Charcoal
          surface: "#1f1f1f",    // Smooth Charcoal Surface
          elevated: "#262626",   // Elevated Layer
          border: "#333333",     // Subtle Crisp Border
          accent: "#f2572b",     // Juicy Electric Sunset Orange
          accentHover: "#ff6d42",// Vibrant Hover
          secondary: "#a3a3a3",  // Neutral Silver Gray
          cream: "#e5e5e5",      // Crisp Light Silver
          light: "#ffffff",      // Pure White
          charcoal: "#262626",   // Muted divider
          muted: "#737373",      // Secondary text
          orange: "#f2572b",     // Direct Juicy Orange Accent
        },
        // Mapped aliases
        claude: {
          bg: "#171717",
          card: "#1f1f1f",
          elevated: "#262626",
          sidebar: "#141414",
          border: "#333333",
          borderDark: "#404040",
          primary: "#f2572b",
          primaryHover: "#ff6d42",
          primaryDark: "#d84318",
          text: "#e5e5e5",
          muted: "#a3a3a3",
          dim: "#262626",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Merriweather", "Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}
