// imports
const gulp = require('gulp')
const path = require('path')
const merge = require('merge-stream')

const rename = require('gulp-rename')
const clean = require('gulp-clean')
const include = require('gulp-include')
const typograf = require('gulp-typograf')
const htmlmin = require('gulp-htmlmin')

const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const importCss = require('gulp-import-css')

const concat = require('gulp-concat')
const babel = require('gulp-babel')
const minify = require('gulp-minify')

const imagemin = require('gulp-imagemin')
const imageResize = require('gulp-image-resize')
const webp = require('gulp-webp')

const watch = require('gulp-watch')
const webserver = require('gulp-webserver')


// constants
const NON_BREAKING_HYPHEN = '‑'

const WATCHERS = {
  html: ['./src/**/*.html'],
  styles: ['./src/css/*.css'],
  scripts: ['./src/js/**/*.js'],
}

// typography
const typografRules = [{
  name: 'common/other/nonBreakingHyphen',
  handler: text => text.replace(/\-/g, NON_BREAKING_HYPHEN)
}, {
  name: 'common/other/typographicalEmoticon',
  handler: text => text
    .replace(/\:\ \–\)/g, ':–)')
    .replace(/\:\ \–\(/g, ':–(')
    .replace(/\;\ \–\)/g, ';–)')
}]


// tasks
gulp.task('default', ['html', 'css', 'js', 'images', 'watch', 'webserver'])

gulp.task('build', ['html', 'css', 'js', 'images', 'stuff'], function() {
  gulp.start('clean')
})


gulp.task('html', function() {
  return gulp.src('./src/*.html')
    .pipe(include())
      .on('error', console.log)
    .pipe(typograf({
      locale: ['ru', 'en-US'],
      enableRule: ['ru/optalign/*'],
      disableRule: ['ru/nbsp/afterNumberSign'],
      rules: typografRules
    }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./build/'))
})

gulp.task('css', function() {
  return gulp.src('./src/css/style.css')
    .pipe(importCss())
    .pipe(postcss([ autoprefixer({
      browsers: ['last 4 versions', 'ios 7']
    }) ]))
    .pipe(gulp.dest('./build/css/'))
})

gulp.task('js', function() {
  const main = gulp.src('./src/js/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(minify())
    .pipe(gulp.dest('./build/js/'))

  const external = gulp.src('./src/external/*.js')
    .pipe(gulp.dest('./build/external/'))

  return merge(main, external)
})

gulp.task('images', ['resize'], function() {
  const minifyNormal = gulp.src('./src/static/img/*.{jpg,png,svg}')
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img/'))

  const minifyAdaptive = gulp.src('./src/static/img/tmp/*.{jpg,png}')
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img/'))

  const convertNormal = gulp.src('./src/static/img/*.{jpg,png}')
    .pipe(webp())
    .pipe(gulp.dest('./build/img/'))

  const convertAdaptive = gulp.src('./src/static/img/tmp/*.{jpg,png}')
    .pipe(webp())
    .pipe(gulp.dest('./build/img/'))

  return merge(
    minifyNormal,
    minifyAdaptive,
    convertNormal,
    convertAdaptive
  )
})

gulp.task('resize', function() {
  const sizeX1 = gulp.src('./src/static/img/resize/**/*.{jpg,png}')
    .pipe(imageResize({ width: 320 }))
    .pipe(gulp.dest('./src/static/img/tmp/'))

  const sizeX2 = gulp.src('./src/static/img/resize/**/*.{jpg,png}')
    .pipe(imageResize({ width: 640 }))
    .pipe(rename(function(path) { path.basename += '@2x' }))
    .pipe(gulp.dest('./src/static/img/tmp/'))

  return merge(sizeX1, sizeX2)
})

gulp.task('stuff', function() {
  const favicons = gulp.src('./src/static/favicons/*')
    .pipe(gulp.dest('./build/favicons/'))

  const txt = gulp.src('./src/*.txt')
    .pipe(gulp.dest('./build/'))

  const sw = gulp.src('./src/sw.js')
    .pipe(gulp.dest('./build/'))

  return merge(favicons, txt, sw)
})


gulp.task('watch', function() {
  gulp.watch(WATCHERS.html, ['html'])
  gulp.watch(WATCHERS.styles, ['css'])
  gulp.watch(WATCHERS.scripts, ['js'])
})

gulp.task('webserver', function() {
  gulp.src('./build/')
    .pipe(webserver({
      livereload: {enable: true},
      open: 'http://localhost:8001/',
      port: 8001,
    }))
})

gulp.task('clean', function () {
  return gulp.src('./src/static/img/tmp', {read: false})
    .pipe(clean())
})