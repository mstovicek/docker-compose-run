var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var cleanCss = require('gulp-clean-css');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var del = require('del');
var gulpSequence = require('gulp-sequence');
var htmlReplace = require('gulp-html-replace');

var distDirectory = "./docs"

gulp.task('default', gulpSequence(
    'clean',
    'minify-js',
    'minify-css',
    'html-replace',
    'clean-manifest'
));

gulp.task('clean', function () {
    return del(distDirectory);
});

gulp.task('clean-manifest', function () {
    return del(distDirectory + '/rev-manifest.json');
});

gulp.task('minify-js', function () {
  return gulp.src([
        './node_modules/js-yaml/dist/js-yaml.js',
        './src/js/*.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true
    }))
    .pipe(rev())
    .pipe(gulp.dest(distDirectory))
    .pipe(rev.manifest(distDirectory + '/rev-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest(''));
});

gulp.task('minify-css', function () {
  return gulp.src('./src/css/*.css')
    .pipe(concat('app.min.css'))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(gulp.dest(distDirectory))
    .pipe(rev.manifest(distDirectory + '/rev-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest(''));
});

gulp.task("html-replace", function() {
    return gulp.src('./src/*.html')
        .pipe(htmlReplace({
            'css': 'app.min.css',
            'js': 'app.min.js'
        }))
        .pipe(revReplace({
            manifest: gulp.src(distDirectory + '/rev-manifest.json')
        }))
        .pipe(gulp.dest(distDirectory));
});
