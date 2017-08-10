
var production = process.env.RAILS_ENV === 'production';
var configFile = production ? "./webpack.prod" : "./webpack.dev";

module.exports = require(configFile);
