import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Enable prefetch for faster navigation
  prefetch: true,
  
  // Build options
  build: {
    // Output directory for built files
    assets: 'assets',
  },
  
  // Vite options
  vite: {
    // Clear cache
    clearScreen: false,
    server: {
      watch: {
        usePolling: true,
      }
    }
  }
});