import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:     "#111111",
        bg2:    "#1a1a1a",
        accent: "#F5C400",
        border: "#2a2a2a",
        muted:  "#BFBFBF",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
