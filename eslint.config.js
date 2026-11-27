import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    // TS/TSX no pasa por ESLint: typescript-eslint aún no soporta TypeScript 7
    // (API nativa). El código de producción lo valida `npm run typecheck`
    // (tsc estricto, sin locales/params sin usar); acá queda el tooling JS.
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Playwright corre en Node; los callbacks de page.evaluate usan el DOM
    files: ['e2e/**/*.js', 'playwright.config.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
