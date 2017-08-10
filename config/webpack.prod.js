global.WEBPACK_ENV = "production";
var VERSION = JSON.stringify(process.env.BUILT_AT
  || process.env.HEROKU_SLUG_COMMIT
  || "NONE");
var webpack = require("webpack");
var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var UglifyJsPlugin = require("webpack-uglify-js-plugin");

module.exports = function (config) {
  console.log("INSIDE PRODUCTION WEBPACK CONFIG!");
  config.output.filename = '[name]-[chunkhash].js';
  // PLUGINS:
  [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new ExtractTextPlugin({
      // Temporary hotfix for some issues on staging.
      // - RC 12 MAY 17
      // filename: "dist/styles.css",
      filename: "dist/[name].[chunkhash].css",
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
    }),
  ].forEach(function (x) { config.plugins.push(x) });
  // CHRIS:
  //  I had to remove extractTextPlugin temporarily. Let's talk about getting it
  //  put back in.
  // The code below runs DEVELOPMENT MODE in production, which is bad,
  // but maybe not as bad as the caching issues.
  config
    .module
    .rules
    .push({
      test: [/\.scss$/, /\.css$/],
      use: ["style-loader", "css-loader", "sass-loader"]
    });
}
