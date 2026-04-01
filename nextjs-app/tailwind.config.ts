import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "slide-in": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "fade-in":  { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        blink:     "blink 1s step-start infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "fade-in":  "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
