var gulp   = require('gulp'),
    gutil  = require('gulp-util'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    exec = require('child_process').exec;

var paths = {
  js: './javascripts/**/**/*.js'
};

function oops (s) {
  exec("espeak 'build Error.'");
  exec( 'notify-send "' + (s.message || s) + '"' );
  gutil.log(s.message);
}

gulp.task('watch', function () {
  gulp.watch(paths.js, ['default']);
});

gulp.task('default', function () {
  browserify({
      entries: ['javascripts/farm_designer.js'],
      extensions: ['.js']
    })
  .bundle()
  .on('error', oops)
  .pipe(source('farm-designer.js'))
  .pipe(gulp.dest('public/build/'));
  exec("espeak 'Saved.'");
})
