var path = require("path");
var genConfig = require("./webpack.base");
var conf = genConfig();

var devServerPort = 3808;
const host = process.env["API_HOST"] || "localhost"

conf.mode = "development";
conf.output = {
  // must match config.webpack.output_dir
  path: path.join(__dirname, '..', 'public', 'webpack'),
  publicPath: `//${host}:${devServerPort}/webpack/`,
  filename: '[name].js'
};

conf.devServer = {
  port: devServerPort,
  disableHostCheck: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  host: "0.0.0.0",
  headers: { 'Access-Control-Allow-Origin': '*' }
};

module.exports = conf;
