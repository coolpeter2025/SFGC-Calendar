import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#f5f3ef",
          100: "#e8e3d9",
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
