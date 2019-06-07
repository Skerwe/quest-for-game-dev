const { src, dest, watch, series, parallel } = require("gulp");
const data = require('gulp-data');
const rimraf = require("gulp-rimraf");
const nunjucksRender = require("gulp-nunjucks-render");
const autoprefixer = require("gulp-autoprefixer");
const sassdoc = require("sassdoc");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
// const imagemin = require("gulp-imagemin");
// const pngquant = require("imagemin-pngquant");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

const siteOutput = "dist/";
const inputPages = "app/pages/**/*.+(html|njk)";
const inputTemplates = "app/templates/**/*.+(html|njk)";
const inputSass = "app/scss/*.scss";
const inputMain = "app/scss/main.scss";
const inputStatic = "app/static/*";
const inputCSS = "app/css/*.css";
const inputScripts = "app/scripts/*.js";
const outputStyles = siteOutput + "/css";

var sassOptions = {
  outputStyle: "expanded"
};
var autoprefixerOptions = {
  browsers: ["last 2 versions", "> 5%", "Firefox ESR"]
};
var sassdocOptions = {
  dest: siteOutput + "/sassdoc"
};

function cleanTask() {
  return src(siteOutput, {
    read: false,
    allowEmpty: true
  }).pipe(rimraf());
}

function sassTask() {
  return src(inputMain)
    .pipe(sass(sassOptions).on("error", sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(dest(outputStyles))
    .pipe(browserSync.stream());
}

function scriptTask() {
  return src(
    ["app/scripts/plugins.js", "app/scripts/main.js"]
  ).pipe(concat({
    path: "main.js"
  }))
  .pipe(browserSync.reload({
    stream: true
  }))
  .pipe(dest(siteOutput + "/js"));
}

function nunjucksTask() {
  return src(inputPages)
    .pipe(data(function () {
      return require('./app/data.json')
    }))
    .pipe(nunjucksRender({
      path: ["app/templates"]
    })).pipe(
      dest(siteOutput)
    );
}

function sassDocTask() {
  return src(inputSass).pipe(sassdoc(sassdocOptions)).resume();
}

function copyStaticTask() {
  return src(inputStatic).pipe(dest(siteOutput));
}

function copyCssTask() {
  return src(inputCSS).pipe(dest(outputStyles));
}

function watchTask() {
  watch(inputSass, sassTask);
  watch([inputScripts], scriptTask).on('change', browserSync.reload);
  watch([inputPages, inputTemplates], nunjucksTask).on('change', browserSync.reload);
}

function browserSyncTask() {
  browserSync.init({
    server: {
      baseDir: siteOutput
    }
  });
}

exports.watch = watchTask;
exports.clean = cleanTask;
exports.sass = sassTask;
exports.sassdoc = sassDocTask;
exports.nunjucks = nunjucksTask;
exports.scripts = scriptTask;
exports.copystatic = series(copyStaticTask, copyCssTask);
exports.build = series(nunjucksTask, sassTask, copyStaticTask, copyCssTask, scriptTask);
exports.default = series(cleanTask, nunjucksTask, sassTask, sassDocTask, copyStaticTask, copyCssTask, scriptTask);
exports.serve = parallel(browserSyncTask, watchTask);
