const path = require('path');

/** @type {import('jest').Config} */
const config = {
  // This file lives in tests/, but the project (src, tsconfig, etc.) lives
  // one level up — anchor rootDir there so <rootDir>-based paths below
  // (and the ts-jest tsconfig lookup) resolve correctly.
  rootDir: path.resolve(__dirname, '..'),

  testEnvironment: 'jest-environment-jsdom',

  // Instructs Jest to transform TS / TSX files using ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tests/tsconfig.json' }],
  },

  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],

  // Handles CSS and path alias imports
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  clearMocks: true,
};

module.exports = config;
