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
        /* Azul marino profundo - color principal */
        navy: {
          DEFAULT: '#002855',
          light: '#003d82',
          dark: '#001a3a',
        },
        /* Fondo claro tipo hielo */
        ice: {
          DEFAULT: '#F8F9FA',
          dark: '#E9ECEF',
        },
        /* Turquesa tropical - el color estrella del Caribe */
        ocean: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          DEFAULT: '#00ACC1',
          600: '#00838F',
          700: '#006064',
        },
        /* Arena de playa */
        sand: {
          light: '#FFF8E1',
          DEFAULT: '#FFE0B2',
          dark: '#FFB74D',
        },
        /* Colores de acento marítimo */
        maritime: {
          red: '#DC3545',
          green: '#28A745',
          gold: '#FFD700',
          coral: '#FF7043',
        },
        /* Azul cielo suave */
        sky: {
          soft: '#E3F2FD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #002855 0%, #006064 50%, #00ACC1 100%)',
        'tropical-gradient': 'linear-gradient(135deg, #002855 0%, #003d82 40%, #00838F 100%)',
        'sand-gradient': 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(0,40,85,0.7) 0%, rgba(0,96,100,0.5) 50%, rgba(0,40,85,0.8) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-5px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
