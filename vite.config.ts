
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // This allows the code to use process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || '')
  }
});
