
var production = [
  process.env.RAILS_ENV,
  process.env.TARGET
].includes('production');

var configFile = production ? "./webpack.prod" : "./webpack.dev";

module.exports = require(configFile);
