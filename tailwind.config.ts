import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,js}",
    "./src/**/**/*.vue", // Ensure deep scanning for Vue components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;