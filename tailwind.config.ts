import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E8E2D9",
        secondary: "#9AA0A6",
        accent1: "#C4714A",
        accent2: "#6A8CAA",
        deep: "#1A1A18",
        highlight: "#F5F2EC",
        sage: "#8A9B7A",
      },
      fontFamily: {
        sans: ["Space Grotesk", "DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
