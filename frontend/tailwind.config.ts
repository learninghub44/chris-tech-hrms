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
          paper: "#f6f3ec",
          graphite: "#0b0e14",
          steel: "#11151f",
          slate: "#1b2130",
          blue: "#2954eb",
          blueDeep: "#1c3bb8",
          ice: "#c9a567"
        }
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
        inter: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-poppins)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(11, 14, 20, 0.08)",
        glow: "0 0 60px rgba(52, 84, 209, 0.35)",
        gold: "0 0 48px rgba(201, 165, 103, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
