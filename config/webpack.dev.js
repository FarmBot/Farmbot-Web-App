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

console.log("INSIDE DEV MODE WEBPACK CONFIG!");

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
    publicPath: '//localhost:' + devServerPort + '/webpack/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: [/\.scss$/, /\.css$/],
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      { test: /\.tsx?$/, use: "ts-loader" },
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
  devServer: {
    port: devServerPort,
    disableHostCheck: true,
    host: "0.0.0.0",
    headers: { 'Access-Control-Allow-Origin': '*' }
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
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ]
}
