'use strict';
global.WEBPACK_ENV = "production";
var path = require("path");
var UglifyJsPlugin = require("webpack-uglify-js-plugin");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var webpack = require("webpack");
var StatsPlugin = require('stats-webpack-plugin');
var publicPath = '/webpack/';

var conf = {
  mode: "none",
  devtool: "inline-source-map", // inlines SourceMap into original file
  // devtool: "eval-source-map", // inlines SourceMap per module
  // devtool: "hidden-source-map", // SourceMap without reference in original file
  // devtool: "cheap-source-map", // cheap-variant of SourceMap without module mappings
  // devtool: "cheap-module-source-map", // cheap-variant of SourceMap with module mappings
  entry: {
    "app_bundle": "./webpack/entry.tsx",
    "front_page": "./webpack/front_page/index.tsx",
    "password_reset": "./webpack/password_reset/index.tsx",
    "tos_update": "./webpack/tos_update/index.tsx"
  },
  output: {
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[id].[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: [/\.scss$/, /\.css$/],
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        test: [/\.woff$/, /\.woff2$/, /\.ttf$/],
        use: "url-loader"
      },
      {
        test: [/\.eot$/, /\.svg(\?v=\d+\.\d+\.\d+)?$/],
        use: "file-loader"
      }
    ]
  },
  // Allows imports without file extensions.
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".css", ".scss", ".json"]
  },
  plugins: [
    new StatsPlugin('manifest.json', {
      // We only need assetsByChunkName
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true
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
  ],
  node: {
    fs: "empty"
  }
};
var accessToken = process.env.ROLLBAR_ACCESS_TOKEN
if (accessToken) {
  console.log("============= PERFORMING ROLLBAR CONFIG")
  var RollbarSourceMapPlugin = require('rollbar-sourcemap-webpack-plugin')
  var version = process.env.BUILT_AT || process.env.HEROKU_SLUG_COMMIT || "????"
  var plugin = new RollbarSourceMapPlugin({accessToken, version, publicPath})
  conf.plugins.push(plugin)
} else {
  console.log("============= SKIPPING ROLLBAR CONFIG")
}
module.exports = conf;
