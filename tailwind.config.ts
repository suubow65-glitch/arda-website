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
        navy: {
          DEFAULT: "#0B2D47",
          50: "#E8EEF3",
          100: "#C5D4E0",
          800: "#082438",
          900: "#061C2C",
        },
        relief: {
          DEFAULT: "#5CA83F",
          50: "#EEF7EA",
          100: "#D4EBC8",
          700: "#478230",
        },
        action: {
          DEFAULT: "#ED8D2E",
          50: "#FDF3E8",
          100: "#F9DCB8",
          700: "#C46E18",
        },
        surface: "#F8FAFC",
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 12px 40px -16px rgba(11, 45, 71, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
