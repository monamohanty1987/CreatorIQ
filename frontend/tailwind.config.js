export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:      "#0F172A",
        darker:          "#090E1A",
        card:            "#1E293B",
        border:          "#334155",
        foreground:      "#F1F5F9",
        "muted-fg":      "#94A3B8",
        primary:         "#1A56DB",
        "primary-light": "#3B82F6",
        accent:          "#10B981",
        amber:           "#F59E0B",
        danger:          "#EF4444",
        purple:          "#8B5CF6",
        cyan:            "#06B6D4",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
