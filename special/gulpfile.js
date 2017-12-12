// imports
const gulp = require('gulp')
const path = require('path')

const rename = require('gulp-rename')
const include = require('gulp-include')
const typograf = require('gulp-typograf')
const htmlmin = require('gulp-htmlmin')

const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const importCss = require('gulp-import-css')
const cssnano = require('gulp-cssnano')

const concat = require('gulp-concat')
const babel = require('gulp-babel')
const minify = require('gulp-minify')

const watch = require('gulp-watch')
const webserver = require('gulp-webserver')



// constants
const NON_BREAKING_HYPHEN = '‑'

const WATCHERS = {
  html: ['./src/**/*.html'],
  styles: ['./src/css/*.css'],
  scripts: ['./js/**/*.js'],
  images: [
    './src/static/img/**/*.svg', 
    './src/static/img/**/*.png', 
    './src/static/img/**/*.jpg'
  ],
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
gulp.task('default', ['html', 'watch', 'webserver'])
gulp.task('build', ['html', 'css', 'js', 'static', 'stuff'])

gulp.task('html', function() {
  gulp.src('./src/index.html')
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
  gulp.src('./src/css/main.css')
    .pipe(importCss())
    .pipe(rename('styles.css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(cssnano())
    .pipe(gulp.dest('./build/css/'))
})


gulp.task('js', function() {
  gulp.src('./src/js/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(minify())
    .pipe(gulp.dest('./build/js/'))
  
  // gulp.src('./src/service-worker.js')
  //   .pipe(gulp.dest('./build/'))
})

gulp.task('watch', function() {
  gulp.watch(WATCHERS.html, ['html'])
  gulp.watch(WATCHERS.styles, ['styles'])
  gulp.watch(WATCHERS.scripts, ['scripts'])
})

gulp.task('webserver', function() {
  gulp.src('./build/')
    .pipe(webserver({
      livereload: {enable: true},
      open: 'http://localhost:8001/',
      port: 8001,
    }))
})

gulp.task('stuff', function() {
  gulp.src('./dev/.htaccess')
    .pipe(gulp.dest('./build/'))
  
  gulp.src('./dev/robots.txt')
    .pipe(gulp.dest('./build/'))

  gulp.src('./dev/humans.txt')
    .pipe(gulp.dest('./build/'))

  gulp.src('./dev/static/favicons/**/*')
    .pipe(gulp.dest('./build/favicons/'))
})