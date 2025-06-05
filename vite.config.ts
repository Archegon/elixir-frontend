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

  return {
    plugins: [react(), tailwindcss()],
    
    // Development server configuration
    server: {
      port: devPort,
      host: true,
      cors: true,
      
      // Proxy API and WebSocket requests to backend using env variables
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: wsBaseUrl,
          ws: true,
          changeOrigin: true,
        },
      },
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
  }
})
