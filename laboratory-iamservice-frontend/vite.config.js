import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // server: {
  //   host: true,
  //   port: 5173,
  //   strictPort: false,
  //   cors: true,
  //   allowedHosts: ['ec2-35-172-58-177.compute-1.amazonaws.com'],
  //   hmr: {
  //     host: '0.0.0.0',
  //   }
  // }
})
