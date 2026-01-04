import { defineConfig } from 'vite'

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
      clientPort: 3000
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
        changelog: './pages/changelog.html'
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics', 'vanjs-core']
  },

  // Enable hot module replacement for better development experience
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})
