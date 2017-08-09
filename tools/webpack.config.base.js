var path = require("path");
var webpack = require("webpack");
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var webpack = require("webpack");
var fs = require("fs");
var StatsPlugin = require('stats-webpack-plugin');

var FarmBotRenderer = require("./farmBotRenderer");
var VERSION = JSON.stringify(process.env.BUILT_AT
  || process.env.HEROKU_SLUG_COMMIT
  || "NONE");

// WEBPACK BASE CONFIG
exec("mkdir -p public/app");
exec("echo -n > public/app/index.html");
exec("touch public/app/index.html");
exec("touch public/app/index.html");
exec("rm -rf public/dist");
exec("rm -rf public/*.eot");

var isProd = !!(global.WEBPACK_ENV === "production");

module.exports = function () {
  return {
    entry: {
      "bundle": path.resolve(__dirname, "../webpack/entry.tsx"),
      "front_page": "./webpack/front_page/index.tsx",
      "verification": "./webpack/verification.ts",
      "password_reset": "./webpack/password_reset/index.tsx",
      "tos_update": "./webpack/tos_update/index.tsx"
    },
    output: {
      path: path.resolve(__dirname, "../public"),
      libraryTarget: "umd",
      publicPath: "/",
      devtoolLineToLine: true
    },
    devtool: "eval",

    // Allows imports without file extensions.
    resolve: {
      extensions: [".js", ".ts", ".tsx", ".css", ".scss", ".json", ".hbs"]
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
        }
      ]
    },

    // Shared plugins for prod and dev.
    plugins: [
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
      })
    ],

    // Webpack Dev Server.
    devServer: {
      port: 3808,
      publicPath: "/",
      historyApiFallback: {
        rewrites: [
          { from: /\/app\//, to: "/app/index.html" },
          { from: /password_reset/, to: "password_reset.html" },
        ]
      }
    }
  }
}
