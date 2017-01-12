// https://gist.github.com/danharper/3ca2273125f500429945
var gulp = require("gulp");
var clean = require("gulp-clean");
var browserify = require("browserify");
var watchify = require('watchify');
var babel = require('babelify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var imageResize = require('gulp-image-resize');
var rename = require("gulp-rename");
var less = require('gulp-less');
var path = require('path');

function compile(file) {
    return function() {
        var bundler = browserify('./src/'+file+'.js', {debug: true}).transform(babel);

        return bundler.bundle().on('error', function(err) {
            console.error(err);
            this.emit('end');
        }).pipe(source(file+'.js')).pipe(buffer()).pipe(sourcemaps.init({loadMaps: true})).pipe(sourcemaps.write('./')).pipe(gulp.dest('./build/js'));
    }
}

gulp.task('app', compile("app"));
gulp.task('monkey', compile("monkey"))

gulp.task('watch', function() {
    gulp.watch(['styles/**/*.less'], ['styles']);
    gulp.watch(['src/**/*.js'], ['app', 'monkey']);
    gulp.watch(['icons/**/*.png', 'manifest.json', 'pages/**/*.html'], ['copy']);
});

gulp.task('clean', function() {
    return gulp.src('build').pipe(clean());
})

gulp.task('mrproper', ['clean'], function() {
    return gulp.src('node_modules').pipe(clean());
})

gulp.task('copy', function() {
    return gulp.src(['manifest.json', 'pages/options.html', 'pages/popup.html']).pipe(gulp.dest("build/"));
});

gulp.task('icons', function() {
    return [128, 48, 16].forEach(function(w) {
        return gulp.src('icons/monkey.png').pipe(imageResize({width: w})).pipe(rename(function(path) {
            path.basename += "_" + w;
        })).pipe(gulp.dest('build/icons'));
    });
});

gulp.task('styles', function() {
    return gulp.src('./styles/main.less').pipe(less({
        paths: [path.join(__dirname, 'less', 'includes')]
    })).pipe(gulp.dest('./build/css'));
});

var tasks = ['copy', 'icons', 'styles', 'app', 'monkey'];

gulp.task('build', tasks);

gulp.task('default', [
    ...tasks,
    'watch'
]);
