var gulp   = require('gulp'),
    gutil  = require('gulp-util'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    exec = require('child_process').exec,
    babelify = require('babelify');

var paths = {
  js: './javascripts/**/**/*.js'
};

function oops (s) {
  exec( 'notify-send "' + (s.message || s || "Gulp Error") + '"' );
  gutil.log(s.message);
}

gulp.task('watch', function () {
  gulp.watch(paths.js, ['default']);
});

gulp.task('default', function () {
  browserify('javascripts/farm_designer.js',{debug:true})
  .transform(babelify)
  .bundle()
  .on('error', oops)
  .pipe(source('farm-designer.js'))
  .pipe(gulp.dest('public/build/'));
})
