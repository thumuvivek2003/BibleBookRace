module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules'],
  globals: { vi: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly' },
  rules: {
    // Props are documented with JSDoc rather than prop-types in this project.
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
