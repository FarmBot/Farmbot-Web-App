var path = require('path');
var open = require('open');

module.exports = function (config) {
  config.set({
    singleRun: false,
    autoWatch: true,
    port: 5555,
    browsers: [],
    files: [ 'tests.webpack.js' ],
    frameworks: [ 'jasmine' ],
    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },
    reporters: [ 'progress' ],
    webpack: require("./tools/webpack.config.base.js"),
  });
};
