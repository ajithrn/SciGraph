import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path for GitHub Pages
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB since visualization libs are heavy
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('html2canvas')) return 'html2canvas';
            // Keeping react in the main vendor chunk prevents circular dependencies with its sub-deps
            return 'vendor'; // everything else
          }
        },
      },
    },
  },
})
