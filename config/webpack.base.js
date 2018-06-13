var StatsPlugin = require('stats-webpack-plugin');

module.exports = function () {
  return {
    mode: "production",
    entry: {
      "app_bundle": "./webpack/entry.tsx",
      "front_page": "./webpack/front_page/index.tsx",
      "password_reset": "./webpack/password_reset/index.tsx",
      "tos_update": "./webpack/tos_update/index.tsx"
    },
    // Was "eval", but that did not go well with our CSP
    devtool: "eval",
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
      })
    ],
    node: {
      fs: "empty"
    }
  };
}
