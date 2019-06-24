'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const data = require('gulp-data');
const rimraf = require('gulp-rimraf');
const nunjucksRender = require('gulp-nunjucks-render');
const autoprefixer = require('gulp-autoprefixer');
const sassdoc = require('sassdoc');
const browserSync = require('browser-sync').create();
const cssmin = require('gulp-cssmin');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

const path = {
  input: 'app/',
  output: 'dist/',
  styles: {
    main: 'app/scss/main.scss',
    input: 'app/scss/*.scss',
    output: 'dist/css',
    docs: 'dist/sassdoc'
  },
  nunjucks: {
    pages: 'app/pages/**/*.+(html|njk)',
    templates: 'app/templates/**/*.+(html|njk)',
    data: './app/data.json'
  },
  images: {
    input: 'app/images/**/*',
    output: 'dist/img'
  },
  static: {
    css: 'app/css/*.css',
    other: 'app/static/*'
  }
};

const sassOptions = {
  outputStyle: 'expanded'
};
const sassdocOptions = {
  dest: path.styles.docs
};

function sassTask() {
  return src(path.styles.main)
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(dest(path.styles.output))
    .pipe(browserSync.stream());
}

function sassDocTask() {
  return src(path.styles.input).pipe(sassdoc(sassdocOptions)).resume();
}

function nunjucksTask() {
  return src(path.nunjucks.pages)
    .pipe(data(function () {
      return require(path.nunjucks.data)
    }))
    .pipe(nunjucksRender({
      path: ['app/templates']
    }))
    .pipe(dest(path.output))
    .pipe(browserSync.stream());
}

function imagesMinTask() {
  return src(path.images.input)
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(dest(path.images.output));
}

function cleanTask() {
  return src(path.output, {
    read: false,
    allowEmpty: true
  }).pipe(rimraf());
}

function copyStaticTask() {
  return src(path.static.other).pipe(dest(path.output));
}

function copyCssTask() {
  return src(path.static.css)
  .pipe(cssmin({keepSpecialComments : 0}))
  .pipe(dest(path.styles.output));
}

function watchTask() {
  watch(path.styles.input, sassTask);
  watch([path.nunjucks.pages, path.nunjucks.templates], nunjucksTask);
  watch(path.images.input, imagesMinTask).on('change', browserSync.reload);
}

function browserSyncTask() {
  browserSync.init({
    server: {
      baseDir: path.output
    }
  });
}

exports.clean = cleanTask;
exports.sass = sassTask;
exports.sassdoc = sassDocTask;
exports.nunjucks = nunjucksTask;
exports.imagesmin = imagesMinTask;
exports.copystatic = series(copyStaticTask, copyCssTask);
exports.build = series(nunjucksTask, sassTask, copyStaticTask, copyCssTask, imagesMinTask);
exports.default = series(cleanTask, nunjucksTask, sassTask, sassDocTask, copyStaticTask, copyCssTask, imagesMinTask);
exports.serve = parallel(browserSyncTask, watchTask);
