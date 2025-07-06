export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // blue-600
        "primary-foreground": "#fff",
        secondary: "#f3f4f6", // gray-100
        "secondary-foreground": "#1f2937", // gray-800
      },
    },
  },
  plugins: [],
};
