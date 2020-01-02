const gulp = require('gulp')
const clean = require('gulp-clean')
const imageResize = require('gulp-image-resize')
const less = require('gulp-less')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const sourcemaps = require('gulp-sourcemaps')
const zip = require('gulp-zip')
const log = require('fancy-log')

const babel = require('babelify')
const browserify = require('browserify')
const stringify = require('stringify')
const watchify = require('watchify')

const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const path = require('path')
const fs = require('fs')

const series = gulp.series

const exec = require('child_process').exec;

function compile(file, withWatchify = false) {
  let bundler = browserify('./src/' + file + '.js', watchify.args
  ).transform(stringify, {
    appliesTo: {
      includeExtensions: ['.mnky', '.md', '.snippets']
    }
  })

  if (withWatchify) {
    bundler = watchify(bundler)
  }

  bundler = bundler.transform(babel)

  const b = function () {
    const bundleStream = bundler.bundle().on('error', function (err) {
      log(err.message)
      this.emit('end')
    })

    return bundleStream
      .pipe(source(file + '.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/js'))
  }

  bundler.on('update', b) // on any dep update, runs the bundler
  bundler.on('log', log) // output build logs to terminal

  return b
}

gulp.task('app', compile('app'))
gulp.task('monkey', compile('monkey'))
gulp.task('background', compile('background'))

gulp.task('watch-app', compile('app', true))
gulp.task('watch-monkey', compile('monkey', true))
gulp.task('watch-background', compile('background', true))

gulp.task('watch', function () {
  gulp.watch(['styles/**/*.less'], gulp.series('styles'))
  gulp.watch(['src/**/*.js', 'src/**/*.snippets'], gulp.parallel('watch-app', 'watch-monkey', 'watch-background'))
  compile('app', true)
  compile('monkey', true)
  compile('background', true)
  gulp.watch([
    'icons/**/*.png', 'manifest.json', 'pages/**/*.html', 'README.md', 'USAGE.md', 'LICENSE', 'src/test.js', 'src/backup.js',
    'scripts/**/*.js'
  ], gulp.series('copy'))
})

gulp.task('clean', function () {
  return gulp.src('build').pipe(clean())
})

gulp.task('mrproper', series('clean', function () {
  return gulp.src('node_modules').pipe(clean())
}))

gulp.task('copy', function () {
  return gulp.src(['README.md', 'USAGE.md', 'LICENSE', 'manifest.json', 'pages/options.html', 'pages/devtools.html', 'pages/popup.html',
    'pages/background.html', 'pages/test.html', 'src/test.js', 'pages/backup.html', 'src/backup.js',
    'scripts/**/*.js'
  ])
    .pipe(gulp.dest('build/'))
})

gulp.task('icons', function () {
  return new Promise(function (resolve) {
    [128, 48, 16].forEach(function (w) {
      return gulp.src(['icons/monkey.png', 'icons/monkey-dev.png']).pipe(imageResize({
        width: w
      })).pipe(rename(function (path) {
        path.basename += '_' + w
      })).pipe(gulp.dest('build/icons'))
    })
    resolve()
  })
})

gulp.task('styles', function () {
  return gulp.src('./styles/main.less').pipe(less({
    paths: [path.join(__dirname, 'less', 'includes')]
  })).pipe(gulp.dest('./build/css'))
})

gulp.task('git-get-commit', function (cb) {
  exec('echo $(git rev-parse HEAD) \\#$(git status --porcelain | wc -l)', function (err, stdout, stderr) {
    if (err) {
      cb(err)
    } else {
      log(stdout)
      log.error(stderr)
      fs.writeFile('./build/.git-commit', stdout, cb)
    }
  })
})

const tasks = [
  'copy',
  'icons',
  'styles',
  'app',
  'monkey',
  'background'
]

gulp.task('build', gulp.parallel(tasks))

gulp.task('pack', function () {
  const [commit, changes] = fs.readFileSync('./build/.git-commit').toString().split('#')
  if (parseInt(changes, 10) > 0) {
    throw new Error('Please commit all changes before packing a release!')
  }
  log(`\`- from commit ${commit}`)
  const json = JSON.parse(fs.readFileSync('./manifest.json'))
  return gulp.src('build/**').pipe(zip('DemoMonkey-' + json.version + '.zip')).pipe(gulp.dest('.'))
})

gulp.task('dev:copy', function () {
  return gulp.src('build/**').pipe(gulp.dest('build-dev/'))
})

gulp.task('dev:manifest', series('dev:copy', function () {
  return gulp.src('build-dev/manifest.json')
    .pipe(clean())
    .pipe(replace(/"name": "([^"]*)"/g, '"name": "$1 (dev-channel)"'))
    .pipe(replace(/"(default_icon|16|48|128)": "([^_]*)([^"]*)"/g, '"$1": "$2-dev$3"'))
    .pipe(gulp.dest('build-dev/'))
}))

gulp.task('dev:pack', series('dev:manifest', function () {
  const json = JSON.parse(fs.readFileSync('./manifest.json'))
  return gulp.src('build-dev/**').pipe(zip('DemoMonkey-' + json.version + '-dev.zip')).pipe(gulp.dest('.'))
}))

gulp.task('dev:clean', series('dev:pack', function () {
  return gulp.src('build-dev').pipe(clean())
}))

gulp.task('pack-dev', series('dev:clean'))

gulp.task('default', gulp.series(gulp.parallel(tasks), 'watch'))
