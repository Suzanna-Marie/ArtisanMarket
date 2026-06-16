import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        or: '#8B6914',
        'or-clair': '#E8B84B',
        foret: '#2D5016',
        creme: '#FAF7F0',
        'sidebar': '#0F172A',
        'sidebar-hover': '#1E293B',
        'sidebar-active': '#334155',
      },
    },
  },
  plugins: [],
}
export default config
