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
  var input = paths.jsIn;
  var output = gulp.dest(paths.jsOut);
  // return gulp.src(input)
  //     .pipe(babel({ }))
  //     .pipe(concat("development.js"))
  //     .pipe(output);
});

gulp.task("hmm", function() {
  var output = gulp.dest(paths.jsOut  + '/whatever.js');
  browserify({entries: ['javascripts/farm_designer.jsx'], extensions: ['.jsx']})
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('public/development.js'));
})
