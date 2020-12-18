const {src, dest, series, parallel, watch} = require('gulp');
const del = require('delete');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const minify = require('gulp-minify');
const concatCss = require('gulp-concat-css');
const htmlReplace = require('gulp-html-replace');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');

function clean(cb) {
    del(['./dist/'], cb)
}

function cssMinify(cb) {
    src("./src/css/*.css")
        .pipe(concatCss("./bundle.css"))
        .pipe(cleanCSS())
        .pipe(dest("./dist/css"))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.'))
        .pipe(dest("./dist/css"))
    cb()
}

function javascript(cb) {
    src('./src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('js/bundle.js'))
        .pipe(minify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist'));
    cb()
}

function imagesMinify(cb) {
    src("./src/images/*")
        .pipe(imagemin())
        .pipe(dest("./dist/images"))
    cb()
}
/**
 * Eg:
 *
 *     <!-- build:css -->
 *     <link rel="stylesheet" href="css/normalize.css"/>
 *     <link rel="stylesheet" href="css/style.css"/>
 *     <!-- endbuild -->
 *     <!-- build:js -->
 *     <script src="js/app.js"></script>
 *     <!-- endbuild -->
 *
 * @param cb
 */
function html(cb) {
    src('./src/*.html')
        .pipe(htmlReplace({
            'css': 'css/bundle.css',
            'js': 'js/bundle-min.js'
        }))
        .pipe(dest('./dist'));
    cb();
}

function watchToProcess() {
    watch('src/css/**.css', {ignoreInitial: false, delay: 500}, cssMinify);
    watch('src/js/**.js', {ignoreInitial: false, delay: 500}, javascript);
    watch('src/**.html', {ignoreInitial: false, delay: 1}, html);
    watch('src/images/*.*', {ignoreInitial: false, delay: 1}, imagesMinify);
}

exports.clean = clean;
exports.run = series(clean, parallel(javascript,imagesMinify, cssMinify), html);
exports.default = watchToProcess
