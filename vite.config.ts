import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*.{ts,js}': ['vp lint --fix', 'vp fmt . --write'],
    '*.{json,md,yml,yaml}': ['vp fmt . --write'],
  },
  fmt: {
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    printWidth: 80,
    experimentalSortPackageJson: false,
    ignorePatterns: ['.changeset'],
  },
  lint: {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
    env: {
      node: true,
      es2022: true,
    },
    ignorePatterns: ['dist/**', 'node_modules/**', '*.js', 'docs/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
})
