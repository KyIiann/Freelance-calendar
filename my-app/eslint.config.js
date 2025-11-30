import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Prevent incorrect relative imports from top-level 'src' files: they should use ./components/*
  {
    files: ['src/*.{ts,tsx}'],
    rules: {
      // Forbid imports that try to reach local components in `./components/*` from top-level `src` files.
      // This helps prevent accidental imports from `src/components` instead of the real `components` root.
      'no-restricted-imports': ['error', {
        patterns: ['./components/*']
      }],
    },
  },
])
