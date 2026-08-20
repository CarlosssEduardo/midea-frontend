import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou o plugin que seu projeto usa

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild', // <--- Adicione esta linha para evitar o conflito com o Tailwind
  },
})