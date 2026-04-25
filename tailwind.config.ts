import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      colors: {
        cream: {
          50: "#fbf6ec",
          100: "#f7f1e6",
        },
        ink: {
          400: "#a8946d",
          500: "#7a6b50",
          600: "#594b38",
          700: "#3f3525",
          800: "#2a2418",
          900: "#1a160f",
        },
        gold: {
          200: "#f0d9a8",
          300: "#d4b878",
          500: "#d97706",
        },
        // backward-compat alias used by some component classes
        brand: {
          50: "#fbf6ec",
          100: "#f7f1e6",
          600: "#594b38",
          700: "#3f3525",
          800: "#2a2418",
          900: "#1a160f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
