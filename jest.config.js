//===== (Jest Configuration) ======
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/*.test.{js,jsx}',
    '!**/setupTests.js',
    '!**/jest.config.js',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 75,
      branches: 60,
      statements: 70,
    },
  },
};
