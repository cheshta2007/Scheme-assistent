import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/check-eligibility': 'http://127.0.0.1:8000',
      '/check-eligibility-with-explanation': 'http://127.0.0.1:8000',
      '/schemes': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000'
    }
  }
});
