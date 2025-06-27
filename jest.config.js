module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  logHeapUsage: true,
  globals: {
    globalConfig: {
      NODE_ENV: "development",
      TOS_URL: "https://farm.bot/tos/",
      PRIV_URL: "https://farm.bot/privacy/",
      LONG_REVISION: "------------",
      SHORT_REVISION: "--------"
    },
    TextEncoder: require('util').TextEncoder,
    TextDecoder: require('util').TextDecoder,
  },
  setupFiles: [
    "./frontend/__test_support__/setup_enzyme.ts",
    "./frontend/__test_support__/localstorage.js",
    "./frontend/__test_support__/mock_fbtoaster.ts",
    "./frontend/__test_support__/mock_i18next.ts",
    "./frontend/__test_support__/additional_mocks.tsx",
    "./frontend/__test_support__/three_d_mocks.tsx",
    "jest-canvas-mock",
  ],
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  moduleNameMapper: {
    "^axios": require.resolve("axios"),
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "frontend/**/*.{ts,tsx}"
  ],
  reporters: [
    "default",
    "jest-skipped-reporter"
  ],
  coverageReporters: [
    "html",
    "json",
    "lcov"
  ],
  coverageDirectory: "<rootDir>/coverage_fe",
  setupFilesAfterEnv: [
    "<rootDir>/frontend/__test_support__/setup_tests.ts"
  ]
}
