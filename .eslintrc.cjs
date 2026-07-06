module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-hooks'],
  ignorePatterns: ['dist', 'playwright-report', 'test-results', '*.config.ts', '*.config.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
