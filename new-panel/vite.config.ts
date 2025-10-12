import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    fs: {
      // allow importing assets from monorepo parent folders
      allow: ['..', '/root/KurbanCebimde/kurban-cebimde/frontend/assets']
    }
  }
})


