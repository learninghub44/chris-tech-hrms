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
        },
        // New premium enterprise SaaS palette (redesign token set).
        // Additive — existing "ct"/"brand" tokens are untouched so
        // unmigrated pages keep working while pages are redesigned.
        primary: {
          DEFAULT: "#2563EB",
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1d4ed8"
        },
        accent: "#3B82F6",
        canvas: "#F8FAFC",
        ink2: {
          DEFAULT: "#0F172A",
          soft: "#64748B"
        },
        edge: "#E2E8F0",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444"
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
        inter: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-poppins)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "var(--font-poppins)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "1rem",
        card: "0.875rem"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 31, 61, 0.04), 0 8px 24px rgba(15, 31, 61, 0.06)",
        card: "0 1px 3px rgba(15, 31, 61, 0.06)",
        glow: "0 4px 14px rgba(29, 91, 214, 0.24)",
        gold: "0 4px 14px rgba(29, 91, 214, 0.24)",
        elevated: "0 2px 4px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out",
        shimmer: "shimmer 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
