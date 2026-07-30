//===== (Imports) ======
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

//===== (Test Globals) ======
const testGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  jest: 'readonly',
  test: 'readonly',
};

//===== (ESLint Configuration) ======
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**'],
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', 'setupTests.js'],
    languageOptions: {
      globals: testGlobals,
    },
  },
]);
