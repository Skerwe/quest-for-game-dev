const { src, dest, series } = require("gulp");
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
const inputTemplates = "app/pages/**/*.+(html|njk)";

const input = "app/scss/*.scss";
const inputMain = "app/scss/main.scss";
const output = siteOutput + "/css";

var sassOptions = {
  outputStyle: "expanded"
};
var autoprefixerOptions = {
  browsers: ["last 2 versions", "> 5%", "Firefox ESR"]
};
var sassdocOptions = {
  dest: siteOutput + "/sassdoc"
};

function cleanTask () {
  return src(siteOutput, {
    read: false
  }).pipe(rimraf());
}

function sassTask () {
  return src(inputMain).pipe(sass(sassOptions).on("error", sass.logError)).pipe(
    autoprefixer(autoprefixerOptions)
  ).pipe(dest(output)).pipe(browserSync.stream());
}

function scriptTask () {
  return src(
    ["./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js",
      "js/main.js"]
  ).pipe(concat({
    path: "main.js"
  })).pipe(browserSync.reload({
    stream: true
  })).pipe(
    gulp.dest(
      siteOutput + "/js"
    )
  );
}

function nunjucksTask () {
  return src(inputTemplates).pipe(nunjucksRender({
    path: ["app/templates"]
  })).pipe(
    dest(siteOutput)
  );
}

function sassDocTask () {
  return src(input).pipe(sassdoc(sassdocOptions)).resume();
}

exports.clean = cleanTask;
exports.sass = sassTask;
exports.build = nunjucksTask;
exports.default = series(cleanTask, nunjucksTask);
