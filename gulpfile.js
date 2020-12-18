const {src, dest, series, parallel, watch} = require('gulp');
const del = require('delete');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const minify = require('gulp-minify');
const concatCss = require('gulp-concat-css');
const htmlReplace = require('gulp-html-replace');
const concat = require('gulp-concat');

function clean(cb) {
    del(['./dist/'], cb)
}

function cssMinify(cb) {
    src("./src/css/*.css")
        .pipe(concatCss("./bundle.css"))
        .pipe(cleanCSS())
        .pipe(dest("./dist/css"))
    cb()
}

function javascript(cb) {
    src('./src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('js/bundle.js'))
        .pipe(minify())
        .pipe(sourcemaps.write('./map'))
        .pipe(dest('./dist'));
    cb()
}


function html(cb) {
    src('./src/*.html')
        .pipe(htmlReplace({
            'css': 'css/bundle.css',
            'js': 'js/bundle.js'
        }))
        .pipe(dest('./dist'));
    cb();
}

function watchToProcess() {
    watch('src/css/**.css', {ignoreInitial: false, delay: 500}, cssMinify);
    watch('src/js/**.js', {ignoreInitial: false, delay: 500}, javascript);
    watch('src/**.html', {ignoreInitial: false, delay: 1}, html);
}

exports.clean = clean;
exports.run = series(clean, parallel(javascript, cssMinify), html);
exports.default = watchToProcess
