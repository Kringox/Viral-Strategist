
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Stellt sicher, dass process.env auch im Browser-Bundle (via Vite) verfügbar ist
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
