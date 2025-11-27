import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Scienc-ai-social/', // <-- exact repo name with leading and trailing slash
  plugins: [react()]
})
