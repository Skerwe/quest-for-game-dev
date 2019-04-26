const { src, dest, series } = require('gulp');
const rimraf = require('gulp-rimraf');
const nunjucksRender = require('gulp-nunjucks-render');

const siteOutput = 'dist/';
const inputTemplates = 'app/pages/**/*.+(html|njk)';

function clean() {
  return src(siteOutput, { read: false }).pipe(rimraf());
}

function nunjucks(cb) {
  return src(inputTemplates)
    .pipe(nunjucksRender({
      path: ['app/templates']
    }))
    .pipe(dest(siteOutput));
}

exports.clean = clean;
exports.build = nunjucks;
exports.default = series(clean, nunjucks);
