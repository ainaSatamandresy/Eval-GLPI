import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // /api/... → http://localhost/glpi/apirest.php/...
      '/api': {
        target: 'http://glpi.localhost/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/apirest.php'),
      },
      // /spring/... → http://localhost:8081/spring/...
      '/spring': {
        target: 'http://localhost:8075',
        changeOrigin: true,
      },
    },
  },
})
