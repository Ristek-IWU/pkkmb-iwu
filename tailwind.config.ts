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
        navy: {
          primary: '#0A192F',
          secondary: '#0F2042',
        },
        accent: {
          purple: '#7C3AED',
          'soft-purple': '#9333EA',
          gold: '#D4AF37',
        },
        neutral: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
