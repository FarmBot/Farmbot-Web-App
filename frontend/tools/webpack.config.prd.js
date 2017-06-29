global.WEBPACK_ENV = "production";

var webpack = require("webpack");
var exec = require("child_process").execSync;
var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var UglifyJsPlugin = require("webpack-uglify-js-plugin");

var generateConfig = require("./webpack.config.base");
var FarmBotRenderer = require("./farmBotRenderer");

c = function () {

  var conf = generateConfig();

  conf.module.rules.push({
    test: [/\.scss$/, /\.css$/],
    loader: ExtractTextPlugin.extract("css-loader!sass-loader")
  });

  conf.output.filename = "dist/[name].[chunkhash].js";

  // PLUGINS:
  [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.REVISION": JSON.stringify(
        exec("git log --pretty=format:'%h%n%ad%n%f' -1").toString())
    }),
    new ExtractTextPlugin({
      // Temporary hotfix for some issues on staging.
      // - RC 12 MAY 17
      filename: "dist/styles.css",
      // filename: "dist/styles.[chunkhash].css",
      disable: false,
      allChunks: true
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require("cssnano"),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    }),
    new UglifyJsPlugin({
      cacheFolder: path.resolve(__dirname, "../public/dist/cached_uglify/"),
      debug: true,
      minimize: true,
      sourceMap: true,
      screw_ie8: true,
      output: { comments: false },
      compressor: { warnings: false }
    })
  ].forEach(function (x) { conf.plugins.push(x) });

  return conf;

}

module.exports = c();
