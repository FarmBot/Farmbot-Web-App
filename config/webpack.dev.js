var path = require("path");
var StatsPlugin = require('stats-webpack-plugin');
var host = process.env["API_HOST"] || "localhost"
var devServerPort = 3808;

module.exports = {
  mode: "none",
  output: {
    // must match config.webpack.output_dir
    path: path.join(__dirname, '..', 'public', 'webpack'),
    publicPath: `//${host}:${devServerPort}/webpack/`,
    filename: '[name].js'
  },
  entry: {
    "app_bundle": "./webpack/entry.tsx",
    "front_page": "./webpack/front_page/index.tsx",
    "password_reset": "./webpack/password_reset/index.tsx",
    "tos_update": "./webpack/tos_update/index.tsx"
  },
  devtool: "eval",
  module: {
    rules: [
      {
        test: [/\.scss$/, /\.css$/],
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.tsx?$/,
        use: "awesome-typescript-loader"
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
    })
  ],
  node: {
    fs: "empty"
  },
  devServer: {
    port: devServerPort,
    disableHostCheck: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    host: "0.0.0.0",
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
};
