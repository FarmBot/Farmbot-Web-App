var devServerPort = 3808;
var path = require("path");
var genConfig = require("./webpack.base");
var conf = genConfig();

conf.output = {
  // must match config.webpack.output_dir
  path: path.join(__dirname, '..', 'public', 'webpack'),
  publicPath: '//localhost:' + devServerPort + '/webpack/',
  filename: '[name].js'
};

conf.devServer = {
  port: devServerPort,
  disableHostCheck: true,
  host: "0.0.0.0",
  headers: { 'Access-Control-Allow-Origin': '*' }
};

module.exports = conf;
