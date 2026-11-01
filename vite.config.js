import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:10000',
      '/socket.io': {
        target: 'ws://localhost:10000',
        ws: true,
      },
    },
  },
})
