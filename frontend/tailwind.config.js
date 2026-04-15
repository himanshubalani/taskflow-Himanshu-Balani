/** @type {import('tailwindcss').Config} */
export default {
  content:["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:['"Geist Mono"', '"JetBrains Mono"', '"SF Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        app: '#F7F6F1',
        surface: '#FFFFFF',
        input: '#F7F6F1',
        border: { DEFAULT: '#D3D1C7', subtle: '#F1EFE8' },
        text: { primary: '#2C2C2A', secondary: '#5F5E5A', muted: '#888780', hint: '#B4B2A9' },
        accent: { DEFAULT: '#534AB7', light: '#EEEDFE', mid: '#AFA9EC', dark: '#3C3489' },
        status: {
          todo: { text: '#888780', bg: '#F1EFE8' },
          in_progress: { text: '#185FA5', bg: '#E6F1FB' },
          done: { text: '#3B6D11', bg: '#EAF3DE' },
        },
        priority: {
          high: { text: '#A32D2D', bg: '#FCEBEB' },
          medium: { text: '#854F0B', bg: '#FAEEDA' },
          low: { text: '#3B6D11', bg: '#EAF3DE' },
        }
      },
      boxShadow: {
        none: 'none',
      }
    },
  },
  plugins:[],
}