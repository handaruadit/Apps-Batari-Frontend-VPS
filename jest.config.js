module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|expo-router|@expo)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/*.test.{js,jsx}',
    '!**/setupTests.js',
    '!**/jest.config.js'
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 75,
      branches: 60,
      statements: 70
    }
  }
};
