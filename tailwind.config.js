/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#00c896', dark: '#00a67d' },
        surface: { DEFAULT: '#0d1117', light: '#161b27' },
        border: '#1e2d45',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#00c896',
        chain: '#a78bfa',
        text: {
          primary: '#f0f4ff',
          secondary: '#94a3b8',
          muted: '#475569',
        },
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-500': ['Inter_500Medium'],
        'inter-600': ['Inter_600SemiBold'],
        'inter-700': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
}
