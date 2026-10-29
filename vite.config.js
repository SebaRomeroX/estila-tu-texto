import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      // el criterio de calidad es cobertura 100% de la lógica pura (lib)
      include: ['src/lib/**'],
      exclude: ['src/lib/**/*.test.js', 'src/lib/**/__snapshots__/**'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
