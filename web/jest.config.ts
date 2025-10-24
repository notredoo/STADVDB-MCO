// web/jest.config.js (Modified)
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  projects: [
    {
      displayName: 'components',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['<rootDir>/components/**/*.test.{ts,tsx,js,jsx}', '<rootDir>/app/page.test.{ts,tsx,js,jsx}'],
    },
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/app/api/**/*.test.{ts,tsx,js,jsx}'],
    },
  ],
};

module.exports = createJestConfig(customJestConfig);