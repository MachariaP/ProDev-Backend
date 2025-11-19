import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Development server (localhost only)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // THIS IS THE IMPORTANT PART FOR RENDER
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: true,
    // Allow Render's onrender.com subdomain + any custom domain you might add later
    allowedHosts: [
      'chama-hub-qe2d.onrender.com',   // ← your current URL
      '.onrender.com',                // ← allows ALL *.onrender.com (recommended)
      'localhost',
      '127.0.0.1',
    ],
  },
})
