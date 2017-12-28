var gulp = require('gulp')
var gutil = require('gulp-util')
var clean = require('gulp-clean')
var imageResize = require('gulp-image-resize')
var less = require('gulp-less')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var sourcemaps = require('gulp-sourcemaps')
var zip = require('gulp-zip')

var babel = require('babelify')
var browserify = require('browserify')
var stringify = require('stringify')
var watchify = require('watchify')

var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var path = require('path')
var fs = require('fs')

function compile(file, withWatchify = false) {
  var bundler = browserify('./src/' + file + '.js', watchify.args
  ).transform(stringify, {
    appliesTo: {
      includeExtensions: ['.mnky', '.md']
    }
  })

  if (withWatchify) {
    bundler = watchify(bundler)
  }

  bundler = bundler.transform(babel)

  var b = function () {
    return bundler.bundle().on('error', function (err) {
      console.error(err)
      this.emit('end')
    }).pipe(source(file + '.js')).pipe(buffer()).pipe(sourcemaps.init({
      loadMaps: true
    })).pipe(sourcemaps.write('./')).pipe(gulp.dest('./build/js'))
  }

  bundler.on('update', b) // on any dep update, runs the bundler
  bundler.on('log', gutil.log) // output build logs to terminal

  return b
}

gulp.task('app', compile('app'))
gulp.task('monkey', compile('monkey'))
gulp.task('background', compile('background'))

gulp.task('watch-app', compile('app', true))
gulp.task('watch-monkey', compile('monkey', true))
gulp.task('watch-background', compile('background', true))

gulp.task('watch', function () {
  gulp.watch(['styles/**/*.less'], ['styles'])
  gulp.watch(['src/**/*.js'], ['watch-app', 'watch-monkey', 'watch-background'])
  compile('app', true)
  compile('monkey', true)
  compile('background', true)
  gulp.watch([
    'icons/**/*.png', 'manifest.json', 'pages/**/*.html', 'README.md', 'USAGE.md', 'LICENSE', 'src/test.js', 'src/backup.js',
    'scripts/**/*.js'
  ], ['copy'])
})

gulp.task('clean', function () {
  return gulp.src('build').pipe(clean())
})

gulp.task('mrproper', ['clean'], function () {
  return gulp.src('node_modules').pipe(clean())
})

gulp.task('copy', function () {
  return gulp.src(['README.md', 'USAGE.md', 'LICENSE', 'manifest.json', 'pages/options.html', 'pages/popup.html',
    'pages/background.html', 'pages/test.html', 'src/test.js', 'pages/backup.html', 'src/backup.js',
    'scripts/**/*.js'
  ])
    .pipe(gulp.dest('build/'))
})

gulp.task('icons', function () {
  return [128, 48, 16].forEach(function (w) {
    return gulp.src(['icons/monkey.png', 'icons/monkey-dev.png']).pipe(imageResize({
      width: w
    })).pipe(rename(function (path) {
      path.basename += '_' + w
    })).pipe(gulp.dest('build/icons'))
  })
})

gulp.task('styles', function () {
  return gulp.src('./styles/main.less').pipe(less({
    paths: [path.join(__dirname, 'less', 'includes')]
  })).pipe(gulp.dest('./build/css'))
})

var tasks = [
  'copy',
  'icons',
  'styles',
  'app',
  'monkey',
  'background'
]

gulp.task('build', tasks)

gulp.task('pack', [], function () {
  var json = JSON.parse(fs.readFileSync('./manifest.json'))
  return gulp.src('build/**').pipe(zip('DemoMonkey-' + json.version + '.zip')).pipe(gulp.dest('.'))
})

gulp.task('dev:copy', function () {
  return gulp.src('build/**').pipe(gulp.dest('build-dev/'))
})

gulp.task('dev:clean', ['dev:pack'], function () {
  return gulp.src('build-dev').pipe(clean())
})

gulp.task('dev:manifest', ['dev:copy'], function () {
  return gulp.src('build-dev/manifest.json')
    .pipe(clean())
    .pipe(replace(/"name": "([^"]*)"/g, '"name": "$1 (dev-channel)"'))
    .pipe(replace(/"(default_icon|16|48|128)": "([^_]*)([^"]*)"/g, '"$1": "$2-dev$3"'))
    .pipe(gulp.dest('build-dev/'))
})

gulp.task('dev:pack', ['dev:manifest'], function () {
  var json = JSON.parse(fs.readFileSync('./manifest.json'))
  return gulp.src('build-dev/**').pipe(zip('DemoMonkey-' + json.version + '-dev.zip')).pipe(gulp.dest('.'))
})

gulp.task('pack-dev', ['dev:clean'])

gulp.task('default', [
  ...tasks,
  'watch'
])
