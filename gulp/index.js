'use strict';


var env = require('node-env-file');
var config = require('./config');
var gulp = require('gulp');
var gulpif = require('gulp-if');

env('./.env', { overwrite: true });

/**********************************
  HTML
***********************************/

var minifyHTML = require('gulp-htmlmin');
var nunjucks = require('gulp-nunjucks-html');

// Watch for file changes to  reload on save
gulp.task('html', function() {
  return gulp.src(config.html.src)
    .pipe(nunjucks({
      searchPaths: [ './app/html/' ]
    }))
    .pipe(minifyHTML({ collapseWhitespace: true }))
    .pipe(gulp.dest(config.html.dest));
});


/**********************************
  STYLES
***********************************/

var handleErrors = require('./handle-errors');

var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var minifyCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var cmq = require('gulp-combine-mq');

gulp.task('styles', function() {
  return gulp.src(config.styles.src)
    .pipe(plumber(handleErrors))
    // sourcemaps
    .pipe(gulpif(!global.isMinified, sourcemaps.init()))
    // compile with friends
    .pipe(sass())
    // Prefix css
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'ie 8'],
      cascade: true
    }))
    .pipe(cmq({ log: false, beautify: false }))
    .pipe(gulpif(!global.isMinified, sourcemaps.write('.')))
    // If prod, minify
    .pipe(gulpif(global.isMinified, minifyCss({ compatibility: 'ie8' })))
    // Send to destination folder
    .pipe(gulp.dest(config.styles.dest));
});


/**********************************
  CLEAN
***********************************/

var del = require('del');

gulp.task('clean', function() {
  return del([config.buildDir]);
});



/**********************************
  WATCH HTML E STYLES
***********************************/

gulp.task('watch', function() {
  gulp.watch(config.styles.watch, ['styles']);
  gulp.watch(config.html.watch, ['html']);
});


/**********************************
  LINT
***********************************/
var gutil = require('gulp-util');
var CLIEngine = require('eslint').CLIEngine;

gulp.task('lint', [], function() {

  var warningLimit, txt;

  var cli = new CLIEngine({
    extensions: ['.jsx', '.js']
  });
  var formatter = cli.getFormatter();

  var report = cli.executeOnFiles([
    'app/scripts/actions/',
    'app/scripts/apps/',
    'app/scripts/components/',
    'app/scripts/stores/',
    'app/scripts/utils/'
  ]);

  gutil.log(formatter(report.results));

  warningLimit = (global.environment === 'PROD') ? 0 : 50;

  if (report.errorCount > 0 || report.warningCount > warningLimit) {
    txt = 'No more than 0 error(s) or ' + warningLimit + ' warning(s)!!!';
    gutil.log(gutil.colors.red(txt));
    throw new Error(txt);
  } else {
    if (report.errorCount !== 0 || report.warningCount !== 0) {
      gutil.log(gutil.colors.yellow(
        'Accepting for now. Check open errors/warnings.'
      ));
    }
  }

});



/**********************************
  WEBPACK
***********************************/
var browserSync = require('browser-sync');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var nodeEnv = process.env.NODE_ENV;

// Require ./webpack.config.js and make a bundler from it
var webpackConfig = require('./webpack.config');
var bundler = webpack(webpackConfig);

gulp.task('webpack', function(callback) {

  if (nodeEnv === 'development') {

    browserSync({
      open: 'external',
      host: process.env.BROWSERSYNC_HOST || '',
      server: {
        baseDir: 'dist/',

        middleware: [
          webpackDevMiddleware(bundler, {
            // IMPORTANT: dev middleware can't access config, so we should
            // provide publicPath by ourselves
            publicPath: webpackConfig.output.publicPath,

            // pretty colored output
            stats: { colors: true },

            // for other settings see
            // http://webpack.github.io/docs/webpack-dev-middleware.html

            watchOptions: {
              aggregateTimeout: 610 // to prevent freaking ctrl + s on editor
            }
          }),

          // bundler should be the same as above
          webpackHotMiddleware(bundler)
        ]
      },

      // no need to watch '*.js' here, webpack will take care of it for us,
      // including full page reloads if HMR won't work
      files: [
        'dist/css/*.css',
        'dist/**/*.html'
      ]
    });
  } else {
    webpack(webpackConfig, function(err, stats) {
      if (err) throw new gutil.PluginError('webpack', err);
      gutil.log('[webpack]', stats.toString({
        colors: true
      }));
      callback();
    });
  }
});


/**********************************
  DEV
***********************************/
var runSequence = require('run-sequence');

gulp.task('dev', ['clean'], function() {
  // Do not minify is the default when in dev
  global.isMinified = (process.env.MINIFY) ?
    (process.env.MINIFY === '1') : global.isMini;

  // DEV is the default environment when buidling
  global.environment = (process.env.ENVIRONMENT) || 'DEV';

  return runSequence(
    'html',
    'styles',
    'watch',
    'webpack'
  );
});


gulp.task('build', ['clean'], function() {
  // Minify is the default when building
  global.isMinified = (process.env.MINIFY) ?
    !(process.env.MINIFY !== '1') : true;

  // PROD is the default environment when buidling
  global.environment = (process.env.ENVIRONMENT) || 'PROD';

  return runSequence(
    'html',
    'styles',
    'webpack'
  );
});
