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
        monad: {
          DEFAULT: "#8a58ee",
          dark: "#6b3fd4",
          light: "#a97bf5",
        },
        positive: "#10b981",
        negative: "#ef4444",
        bg: {
          DEFAULT: "#0a0a0a",
          card: "#111111",
          surface: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "bounce-subtle": "bounce-subtle 0.4s ease-in-out",
        "pulse-glow": "pulse-glow 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px #8a58ee44" },
          "50%": { boxShadow: "0 0 20px #8a58ee88" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
