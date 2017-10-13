
var production = [
  process.env.RAILS_ENV,
  process.env.TARGET
].includes('production');

var configFile = production ? "./webpack.prod" : "./webpack.dev";
console.log("==== CONFIG.JS")

module.exports = require(configFile);
