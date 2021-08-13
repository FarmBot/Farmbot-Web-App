const baseConfig = require("../jest.config");

baseConfig.rootDir = "..";
baseConfig.reporters.push([
  "jest-junit",
  {
    outputDirectory: "/tmp/test-results/jest"
  }
]);

module.exports = baseConfig;
