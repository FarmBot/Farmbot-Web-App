
var production = [
  process.env.RAILS_ENV,
  process.env.TARGET
].includes('production');

console.log(`

WEBPACK IS RUNNING IN ${ production ? "prod" : "dev"} MODE.

`)
var configFile = production ? "./webpack.prod" : "./webpack.dev";

module.exports = require(configFile);
