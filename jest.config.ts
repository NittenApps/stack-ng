import { pathsToModuleNameMapper } from 'ts-jest';

export default {
  testEnvironment: '@happy-dom/jest-environment',
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/projects/nittenapps'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['jest-extended/all', '<rootDir>/jestSetup.ts'],
  coverageReporters: ['html'],
  testPathIgnorePatterns: ['/node_modules/', 'schematics/.*/files/(.*)$'],
  moduleNameMapper: pathsToModuleNameMapper(
    {
      '@nittenapps/forms': ['projects/nittenapps/forms/src/public_api'],
      '@nittenapps/forms/testing': ['projects/nittenapps/forms/testing/src/private_api'],
      '@nittenapps/forms/*': ['projects/nittenapps/forms/*/src/public_api'],
      '@nittenapps/*': ['projects/nittenapps/*/src/public_api'],
    },
    { prefix: '<rootDir>/' },
  ),
  transformIgnorePatterns: ['node_modules/(?!@ionic/core|@stencil/core|ionicons|.*\\.mjs$)'],
};
