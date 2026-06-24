import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A8C4E",
          dark: "#136B3A",
          light: "#E8F7EF",
        },
        accent: {
          DEFAULT: "#F5B731",
          dark: "#D4940E",
          light: "#FFF8E6",
        },
      },
    },
  },
  plugins: [],
};
export default config;