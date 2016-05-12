'use strict';

// Core
var path = require('path');

// Frameworks
var gulp = require('gulp');

// Browserify
var buffer = require('vinyl-source-buffer');
var browserify = require('browserify');
var tsify = require('tsify');

// Browser Sync
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Config
var config = require('./gulpconfig');
var postProcessor = [
    require('postcss-zindex'),
    require('autoprefixer')({browsers: ['last 1 version']})
];

// Util
var del = require('del');
var sequence = require('run-sequence');
var mergeStream = require('merge-stream');
var $ = require('gulp-load-plugins')();

//////////////////////////////////////////
/// Util
//////////////////////////////////////////

gulp.task('clean', function () {
    return del.sync(['dist/*', '!dist/.git'], {dot: true});
});

//////////////////////////////////////////
/// Lint
//////////////////////////////////////////

gulp.task('scripts:lint', function () {
    gulp.src(config.paths.typescript.watch)
        .pipe($.tslint({
            configuration: "tslint.json"
        }))
        .pipe($.tslint.report($.tslintStylish, {
            emitError: false,
            sort: true,
            bell: true,
            fullPath: true
        }));
});

gulp.task('styles:lint', function () {
    return gulp.src(config.paths.styles.watch)
        .pipe($.plumber())
        .pipe($.postcss([
            require('stylelint')(),
            require('postcss-reporter')({clearMessages: true, throwError: false})
        ], {syntax: require('postcss-scss')}));
});

gulp.task('lint', function() {
    sequence('scripts:lint', 'styles:lint');
});

//////////////////////////////////////////
/// CSS
//////////////////////////////////////////

gulp.task('styles', ['styles:lint'], function () {
    return gulp.src(config.paths.styles.app)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss(postProcessor))
        .pipe($.cleanCss())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(config.paths.styles.dist))
        .pipe($.size({title: 'styles'}));
});

//////////////////////////////////////////
/// HTML
//////////////////////////////////////////
gulp.task('templates', function () {
    return gulp.src(config.paths.templates.app)
        .pipe($.plumber())
        .pipe($.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
        }))
        .pipe($.angularTemplatecache({
            module: 'example',
            standalone: false,
            transformUrl: function(url) {
                return 'example/' + url
            }
        }))
        .pipe(gulp.dest(config.paths.templates.dist))
        .pipe($.size({title: 'templates'}));
});

//////////////////////////////////////////
/// JavaScript
//////////////////////////////////////////

gulp.task('typescript', ['scripts:lint'], function () {
    return browserify()
        .add(config.paths.typescript.app + '/app.ts')
        .external('angular')
        .plugin(tsify, {
            experimentalDecorators: true
        })
        .bundle()
        .on('error', function (error) { console.error(error.toString()); })
        .pipe($.plumber())
        .pipe(buffer('angular.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(gulp.dest(config.paths.typescript.dist))
        .pipe($.size({title: 'typescript'}));
});

//////////////////////////////////////////
/// Images
//////////////////////////////////////////

gulp.task('images', function () {
    return gulp.src(config.paths.images.app)
        .pipe($.plumber())
        .pipe($.newer(config.paths.images.dist))
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(config.paths.images.dist))
        .pipe($.size({title: 'images'}));
});

//////////////////////////////////////////
/// Watch / Build
//////////////////////////////////////////

gulp.task('watch', function () {
    browserSync({
        notify: false,
        server: ['./']
    });

    gulp.watch(config.paths.typescript.watch, ['typescript', reload]);
    gulp.watch(config.paths.styles.watch, ['styles', reload]);
    gulp.watch(config.paths.templates.watch, ['templates', reload]);
    gulp.watch(config.paths.images.watch, ['images', reload]);
    gulp.watch('index.html', reload);
});

gulp.task('default', ['clean'], function () {
    sequence(['templates', 'typescript', 'styles', 'images']);
});