'use strict';
global.WEBPACK_ENV = "production";
var devServerPort = 3808;
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var fs = require("fs");
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var path = require("path");
var path = require("path");
var production = process.env.RAILS_ENV === 'production';
var StatsPlugin = require('stats-webpack-plugin');
var UglifyJsPlugin = require("webpack-uglify-js-plugin");
var webpack = require("webpack");
var VERSION = JSON.stringify(process.env.BUILT_AT
  || process.env.HEROKU_SLUG_COMMIT
  || "NONE");

console.log("INSIDE PRODUCTION WEBPACK CONFIG!");

module.exports = {
  entry: {
    "bundle": path.resolve(__dirname, "../webpack/entry.tsx"),
    "front_page": "./webpack/front_page/index.tsx",
    "verification": "./webpack/verification.ts",
    "password_reset": "./webpack/password_reset/index.tsx",
    "tos_update": "./webpack/tos_update/index.tsx"
  },
  devtool: "eval",
  output: {
    // must match config.webpack.output_dir
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath: '/webpack/',
    filename: '[name]-[chunkhash].js'
  },
  // Shared loaders for prod and dev.
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader" },
      {
        test: [/\.woff$/, /\.woff2$/, /\.ttf$/],
        use: "url-loader"
      },
      {
        test: [/\.eot$/, /\.svg(\?v=\d+\.\d+\.\d+)?$/],
        use: "file-loader"
      },
      // CHRIS:
      //  I had to remove extractTextPlugin temporarily. Let's talk about getting it
      //  put back in.
      // The code below runs DEVELOPMENT MODE in production, which is bad,
      // but maybe not as bad as the caching issues.
      {
        test: [/\.scss$/, /\.css$/],
        use: ["style-loader", "css-loader", "sass-loader"]
      }

    ]
  },
  // Allows imports without file extensions.
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".css", ".scss", ".json"]
  },
  plugins: [
    // must match config.webpack.manifest_filename
    new StatsPlugin('manifest.json', {
      // We only need assetsByChunkName
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true
    }),
    new webpack.DefinePlugin({
      "process.env.SHORT_REVISION": VERSION
    }),
    // FarmBot Inc related.
    new webpack.DefinePlugin({
      "process.env.NPM_ADDON": JSON.stringify(
        process.env.NPM_ADDON || false).toString()
    }),
    // Conditionally add "terms of service"
    // Eg: Servers run by FarmBot, Inc.
    new webpack.DefinePlugin({
      "process.env.TOS_URL": JSON
        .stringify(process.env.TOS_URL || false).toString()
    }),
    // Conditionally add privacy policy.
    // Eg: Servers run by FarmBot, Inc.
    new webpack.DefinePlugin({
      "process.env.PRIV_URL": JSON
        .stringify(process.env.PRIV_URL || false).toString()
    }),
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
    })]
}
