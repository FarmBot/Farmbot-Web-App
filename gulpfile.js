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
  exec("espeak 'Compile Error.'");
  exec( 'notify-send "' + (s.message || s) + '"' );
  gutil.log(s.message);
}

gulp.task('default', function () {
  var tasks = ['compile'];
  gulp.watch(paths.js, tasks);
});

gulp.task('compile', function () {
  browserify({
      entries: ['javascripts/farm_designer.js'],
      extensions: ['.js']
    })
  .bundle()
  .on('error', oops)
  .pipe(source('farm-designer.js'))
  .pipe(gulp.dest('public/'));
  exec("espeak 'Saved.'");
})
