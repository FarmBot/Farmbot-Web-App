const baseConfig = require("../jest.config");

baseConfig.rootDir = "..";
baseConfig.reporters.push([
  "jest-junit",
  {
    outputDirectory: "test-results/jest"
  }
]);

module.exports = baseConfig;
