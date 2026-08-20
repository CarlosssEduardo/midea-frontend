import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou o plugin que você estiver usando (vue, etc.)

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'postcss', // Força o Vite a usar o PostCSS para ler o Tailwind
  },
  build: {
    cssMinify: 'esbuild', // Usa o esbuild para minificar o CSS sem conflitos
  }
})