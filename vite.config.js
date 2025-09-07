import { defineConfig } from 'vite'

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics', 'vanjs-core']
  }
})
