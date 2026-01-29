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
        // Colores principales del tema náutico
        navy: {
          DEFAULT: '#002855',
          light: '#003d82',
          dark: '#001a3a',
        },
        ice: {
          DEFAULT: '#F8F9FA',
          dark: '#E9ECEF',
        },
        maritime: {
          red: '#DC3545',
          green: '#28A745',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
