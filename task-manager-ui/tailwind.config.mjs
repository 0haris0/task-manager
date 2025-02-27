/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: "#121212",
        darkSecondary: "#1E1E1E",
        textPrimary: "#E0E0E0",
        textSecondary: "#A3A3A3",
        accent: "#4A90E2",
        accentPurple: "#9B51E0",
        danger: "#E53935",
        success: "#27AE60",
      },
    },
  },
  plugins: [],
};
