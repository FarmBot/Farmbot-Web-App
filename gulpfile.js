var gulp   = require('gulp'),
    babel  = require('gulp-babel'),
    rollup = require('gulp-rollup'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

var paths = {
  jsIn: './javascripts/**/**/*.jsx',
  jsOut: './public/js'
};

gulp.task('default', function () {
  browserify({
      entries: ['javascripts/farm_designer.jsx'],
      extensions: ['.jsx']
    })
  .bundle()
  .pipe(source('farm-designer.js'))
  .pipe(gulp.dest('public/'));
});
