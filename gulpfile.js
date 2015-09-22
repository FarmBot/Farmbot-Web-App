var gulp   = require('gulp'),
    gutil  = require('gulp-util'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    exec = require('child_process').exec;

var paths = {
  jsx: './javascripts/**/**/*.jsx'
};

function oops (s) {
  exec( 'notify-send "' + (s.message || s));
  gutil.log(s.fileName);
  gutil.log(s.lineNumber);
  gutil.log(s.message);
}

gulp.task('default', function () {
  gulp.watch(paths.jsx, ['compile']);
});

gulp.task('compile', function () {
  browserify({
      entries: ['javascripts/farm_designer.jsx'],
      extensions: ['.jsx']
    })
  .bundle()
  .on('error', oops)
  .pipe(source('farm-designer.js'))
  .pipe(gulp.dest('public/'));
})
