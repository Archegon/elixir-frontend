import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // Default values for development
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000'
  const wsBaseUrl = env.VITE_WS_BASE_URL || 'ws://localhost:8000'
  const devPort = parseInt(env.VITE_DEV_PORT) || 5173
  const backendPort = parseInt(env.VITE_BACKEND_PORT) || 8000

  return {
    plugins: [react(), tailwindcss()],
    
    // Development server configuration
    server: {
      port: devPort,
      host: '0.0.0.0', // Allow external connections
      cors: true,
      strictPort: false, // Try next port if current is busy
      
      // Proxy API and WebSocket requests to backend using env variables
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          ws: false, // Handle WebSocket separately
          timeout: 5000,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to backend:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from backend:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/ws': {
          target: wsBaseUrl,
          ws: true,
          changeOrigin: true,
          secure: false,
          timeout: 5000,
        },
      },
    },

    // Build configuration for production
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
          },
        },
      },
    },

    // Preview server configuration (for production builds)
    preview: {
      port: devPort + 1,
      host: '0.0.0.0',
      cors: true,
    },

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': '/src',
        '@config': '/src/config',
        '@components': '/src/components',
        '@services': '/src/services',
        '@utils': '/src/utils',
        '@types': '/src/types',
        '@hooks': '/src/hooks',
      },
    },

    // Define global constants
    define: {
      __DEV__: mode === 'development',
      __BACKEND_PORT__: backendPort,
      __AUTO_DISCOVERY__: env.VITE_AUTO_DISCOVERY !== 'false',
    },
  }
})
