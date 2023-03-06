module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  verbose: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  verbose: true,
  rootDir: './',
  automock: false,
  setupFiles: [
    "./shared/setupTest.ts"
  ]
}