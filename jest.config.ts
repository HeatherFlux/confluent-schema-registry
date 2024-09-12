import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  clearMocks: true,
  testTimeout: 2000, // a low timeout causes flakey unit test results when all tests are being executed
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['\\.int\\.ts$'],
  coverageDirectory: './coverage',
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: false }], 'json-summary'],
  globalSetup: './src/test/jest.global-setup.ts',
  globalTeardown: './src/test/jest.global-teardown.ts',
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).ts'],
  modulePathIgnorePatterns: ['dist'],
  testPathIgnorePatterns: ['.cache'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 90,
      lines: 70,
      functions: 90,
    },
  },
}

export default config
