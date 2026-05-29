import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React first
            ['^react$', '^react-dom$', '^react/'],
            // External libraries
            ['^@?\\w'],
            // Internal absolute imports (assuming they start with @ or are just top-level folders in src)
            // If the project doesn't use absolute imports, this will just be empty.
            // Based on previous files, they seem to use relative imports mainly.
            ['^(src|@)(/.*|$)'],
            // Relative imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=[^/]*$)', '^\\./?$'],
            // Side effect imports
            ['^\\u0000'],
            // Types
            ['^.+\\u0000$'],
            // Style imports
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
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
])
