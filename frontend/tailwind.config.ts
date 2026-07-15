import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        surface: "#f6f7f5",
        line: "#dfe5df",
        brand: {
          50: "#eefdf5",
          100: "#d8f7e8",
          600: "#187a52",
          700: "#126340"
        },
        ct: {
          paper: "#f5f7fb",
          graphite: "#0a0e17",
          steel: "#141a2b",
          slate: "#212a42",
          blue: "#2f6fed",
          blueDeep: "#0b3fa8",
          ice: "#7dc4ff"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 33, 29, 0.08)",
        glow: "0 0 60px rgba(47, 111, 237, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
