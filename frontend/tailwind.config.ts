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
          paper: "#ffffff",
          mist: "#f6f8fb",
          graphite: "#0f1f3d",
          steel: "#132a52",
          slate: "#1e3a66",
          blue: "#1d5bd6",
          blueDeep: "#123f9e",
          ice: "#1d5bd6"
        }
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
        inter: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-poppins)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 31, 61, 0.04), 0 8px 24px rgba(15, 31, 61, 0.06)",
        card: "0 1px 3px rgba(15, 31, 61, 0.06)",
        glow: "0 4px 14px rgba(29, 91, 214, 0.24)",
        gold: "0 4px 14px rgba(29, 91, 214, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
