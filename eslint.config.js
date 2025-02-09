// eslint.config.js
module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    // In flat config, plugins are specified as an object.
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },

    rules: {},
  },
];
