import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080808",
        paper: "#ffffff",
        bone: "#f4f4f1",
        line: "#d7d7d0",
        danger: "#c1121f"
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};

export default config;
