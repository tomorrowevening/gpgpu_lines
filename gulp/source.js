var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var browserify = require("browserify");
var babelify = require("babelify");
var watchify = require("watchify");
var glslify = require("glslify");
var uglify = require("gulp-uglify");
var gutil = require("gulp-util");
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");
var notify = require('gulp-notify');
var browserSync = require('browser-sync');

//////////////////////////////////////////////////
// HTML

gulp.task('html', ['styles'], function() {
  var assets = $.useref.assets({
    searchPath: '{.tmp,app}'
  });

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({
      conditionals: true,
      loose: true
    })))
    .pipe(gulp.dest('dist'));
});

//////////////////////////////////////////////////
// JS

gulp.task('scripts', function() {
  const minify = false;
  const input = "app/scripts/index.js";
  const output = "scripts/main.min.js";
  var bundler = browserify({
    debug: true,
    fullPaths: false,
    cache: {},
    packageCache: {},
    entries: [input]
  });
  bundler.transform(babelify, {
    presets: ["latest", "stage-1"]
  });
  bundler.transform(glslify);
  const bundle = () => {
    return bundler
      .bundle()
      .on('error', function(error) {
        const args = Array.prototype.slice.call(arguments);
        notify.onError({
          title: "Compile Error",
          message: error.message
        }).apply(this, args);

        // Proceed
        this.emit('end');
      })
      .pipe(source(output))
      .pipe(buffer())
      .pipe(minify ? uglify() : gutil.noop())
      .pipe(gulp.dest("app"))
      .on('end', function() {
        browserSync.reload();
      });
  };
  bundler = watchify(bundler);
  bundler.on('update', () => {
    console.log(" > Compiling Scripts...");
    bundle();
  });
  return bundle();
});

//////////////////////////////////////////////////
// Styles

gulp.task('styles', function() {
  return gulp.src('app/styles/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/styles'))
});