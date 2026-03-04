import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        admin: {
          bg: "#0f172a",
          sidebar: "#1e293b",
          card: "#1e293b",
          border: "#334155",
          text: "#94a3b8",
          accent: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
