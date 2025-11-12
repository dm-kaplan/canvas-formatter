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
        canvas: {
          blue: "#0374B5",
          orange: "#E13F29",
          green: "#00AC18",
          gray: "#2D3B45",
        },
      },
    },
  },
  plugins: [],
};

export default config;