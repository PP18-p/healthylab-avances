import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todo lo que empiece con /api se envía al servidor Express
      "/api": "http://localhost:3000",
    },
  },
})