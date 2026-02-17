import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Served from root of custom domain
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB since visualization libs are heavy
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('html2canvas')) return 'html2canvas';
            return 'vendor'; // everything else
          }
        },
      },
    },
  },
})
