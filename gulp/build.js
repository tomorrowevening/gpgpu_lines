var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

gulp.task('buildJS', function () {
    return gulp.src(['app/scripts/main.min.js'])
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('buildCSS', function () {
    return gulp.src(['app/styles/main.css'])
    .pipe(gulp.dest('dist/styles'));
});

// Content

gulp.task('html', function () {
    return gulp.src(['app/index.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe( gulp.dest('dist/images') );
});

// Final build

gulp.task('build', ['scripts', 'styles', 'buildJS', 'buildCSS', 'html', 'images'], function() {
    global.build = true;
    return gulp.src('dist/**/*')
        .pipe($.size({
            title: 'build',
            gzip: true
        }))
        .pipe( gulp.dest('dist') );
});