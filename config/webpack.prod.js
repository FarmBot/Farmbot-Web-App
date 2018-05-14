'use strict';
global.WEBPACK_ENV = "production";
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var genConfig = require("./webpack.base");
var UglifyJsPlugin = require("webpack-uglify-js-plugin");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var webpack = require("webpack");

var conf = genConfig();
conf.mode = "production";

conf.output = {
  path: path.join(__dirname, '..', 'public', 'webpack'),
  publicPath: '/webpack/',
  filename: '[name]-[chunkhash].js',
  chunkFilename: '[id].[chunkhash].js'
};

[
  new ExtractTextPlugin({
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
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify("production")
    }
  })
].map(x => conf.plugins.push(x));

module.exports = conf;
