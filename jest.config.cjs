module.exports = {
  preset: 'ts-jest',
  testEnvironment: "@quramy/jest-prisma/environment",
  silent: false, // console.logを有効化
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'], // setup.tsを指定
};