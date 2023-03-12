module.exports = {
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.e2e.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  rootDir: './'
};
