import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C8A96E",
          light: "#e8d5b0",
          dark: "#9a7d4a",
        },
        teal: { DEFAULT: "#4A9B8E" },
        coral: { DEFAULT: "#E07B6A" },
        navy: {
          900: "#0a0a14",
          800: "#0d0d1a",
          700: "#16162a",
          600: "#1a1a2e",
          500: "#1e1e2e",
          400: "#2a2a3e",
          300: "#3a3a5e",
          200: "#5a5a7a",
          100: "#7a7a9a",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "Apple SD Gothic Neo", "sans-serif"],
        mono: ["'Courier New'", "monospace"],
      },
      backgroundImage: {
        "card-gradient": "linear-gradient(135deg, #16162a 0%, #1a1a2e 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
