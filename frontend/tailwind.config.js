/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        foreground: '#ffffff',
        sidebar: '#111113',
        card: '#18181b',
        border: '#27272a',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#a855f7',
          cyan: '#22d3ee',
          rose: '#f43f5e',
        },
        surface: {
          subtle: '#111113',
          card: '#18181b',
          elevated: '#202023',
        }
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
        'ai-gradient-deep': 'linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)',
        'ai-glow': 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
      },
      boxShadow: {
        'premium': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 8px 32px -4px rgba(0, 0, 0, 0.5)',
        'ai-glow': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'inner-glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
