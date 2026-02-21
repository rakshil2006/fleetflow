/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium Brown Theme
        primary: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#bfa094",
          600: "#a18072",
          700: "#977669",
          800: "#846358",
          900: "#43302b",
        },
        accent: {
          50: "#fef3e2",
          100: "#fde6c5",
          200: "#fbd08b",
          300: "#f9ba51",
          400: "#f7a417",
          500: "#d68910",
          600: "#b5740d",
          700: "#945f0a",
          800: "#734a08",
          900: "#523505",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        dark: {
          50: "#f6f5f4",
          100: "#e7e5e4",
          200: "#d6d3d1",
          300: "#a8a29e",
          400: "#78716c",
          500: "#57534e",
          600: "#44403c",
          700: "#292524",
          800: "#1c1917",
          900: "#0c0a09",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-premium":
          "linear-gradient(135deg, #43302b 0%, #78716c 50%, #a18072 100%)",
      },
    },
  },
  plugins: [],
};
