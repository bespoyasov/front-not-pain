import path from "path";
import gulp from "gulp";

import rename from "gulp-rename";
import clean from "gulp-clean";
import concat from "gulp-concat";
import minify from "gulp-minify";

import include from "gulp-include";
import typograf from "gulp-typograf";
import htmlmin from "gulp-htmlmin";
import importCss from "gulp-import-css";

import imagemin from "gulp-imagemin";
import imageResize from "gulp-image-resize";
import webp from "gulp-webp";

import webserver from "gulp-webserver";

function html() {
  const nonBreakingHyphen = "‑";
  const typografRules = [
    {
      name: "common/other/nonBreakingHyphen",
      handler: (text) => text.replace(/\-/g, nonBreakingHyphen),
    },
    {
      name: "common/other/typographicalEmoticon",
      handler: (text) =>
        text
          .replace(/\:\ \–\)/g, ":–)")
          .replace(/\:\ \–\(/g, ":–(")
          .replace(/\;\ \–\)/g, ";–)"),
    },
  ];

  return gulp
    .src("./src/*.html")
    .pipe(include())
    .on("error", console.log)
    .pipe(
      typograf({
        locale: ["ru", "en-US"],
        enableRule: ["ru/optalign/*"],
        disableRule: ["ru/nbsp/afterNumberSign"],
        rules: typografRules,
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./build/"));
}

function css() {
  return gulp
    .src("./src/css/style.css")
    .pipe(importCss())
    .pipe(gulp.dest("./build/css/"));
}

function js() {
  const internal = ["./src/js/**/*.js"];
  const external = ["node_modules/ilyabirman-likely/release/likely.min.js"];

  return gulp
    .src([...internal, ...external])
    .pipe(concat("scripts.js"))
    .pipe(minify())
    .pipe(gulp.dest("./build/js/"));
}

function resize(done) {
  const source = "./src/static/img/resize/**/*.{jpg,png}";
  const target = "./src/static/img/tmp/";

  const x1 = () =>
    gulp
      .src(source)
      .pipe(imageResize({ width: 320 }))
      .pipe(gulp.dest(target));

  const x2 = () =>
    gulp
      .src(source)
      .pipe(imageResize({ width: 640 }))
      .pipe(rename((path) => (path.basename += "@2x")))
      .pipe(gulp.dest(target));

  return gulp.parallel(x1, x2)(done);
}

function images(done) {
  const minify = () =>
    gulp
      .src([
        "./src/static/img/*.{jpg,png,svg}",
        "./src/static/img/tmp/*.{jpg,png}",
      ])
      .pipe(imagemin())
      .pipe(gulp.dest("./build/img/"));

  const toWebp = () =>
    gulp
      .src(["./src/static/img/*.{jpg,png}", "./src/static/img/tmp/*.{jpg,png}"])
      .pipe(webp())
      .pipe(gulp.dest("./build/img/"));

  return gulp.series(resize, gulp.parallel(minify, toWebp))(done);
}

function meta(done) {
  const txt = () => gulp.src("./src/*.txt").pipe(gulp.dest("./build/"));
  const favicons = () =>
    gulp.src("./src/static/favicons/*").pipe(gulp.dest("./build/favicons/"));

  return gulp.parallel(favicons, txt)(done);
}

function cleanup() {
  return gulp
    .src("./src/static/img/tmp", { read: false, allowEmpty: true })
    .pipe(clean());
}

function server() {
  return gulp.src("./build/").pipe(
    webserver({
      livereload: { enable: true },
      open: "http://localhost:8001/",
      port: 8001,
    })
  );
}

gulp.task("watch", function () {
  gulp.watch("./src/**/*.html", html);
  gulp.watch("./src/css/*.css", css);
  gulp.watch("./src/js/**/*.js", js);
});

gulp.task("default", gulp.series(html, css, js, images, server, "watch"));
gulp.task("build", gulp.series(html, css, js, images, meta, cleanup));
