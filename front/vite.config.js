import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for React frontend.
// The backend base URL is controlled from the frontend `.env` via VITE_API_BASE_URL.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

