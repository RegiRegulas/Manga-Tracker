import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  preview: {
    port: 10000,
    host: '0.0.0.0',
    allowedHosts: ['manga-tracker-frontend.onrender.com'], // ✅ Add this line
  },
})
