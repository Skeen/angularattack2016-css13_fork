var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');

// add custom browserify options here
var b_opts = assign({}, watchify.args, opts.browserify);
var bundler = browserify(b_opts).add(src.browserify); 

// Output build logs to the gulp terminal
bundler.on('log', gutil.log);

function bundle()
{
  return bundler.bundle()
    // Log errors when they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    // Generate source maps
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    // Write output file
    .pipe(gulp.dest(dest.js));
}

// Compile everything
// NOTE: Compiling is an alias for bundling
var compile = bundle;

// Incremental compilation
var watch = function()
{
    bundler = watchify(bundler);
    // Whenever one of the bundle dependencies change, rebundle
    bundler.on('update', function()
    {
        gulp.start('browserify:bundle');
    });
};

module.exports = {
  compile: compile,
  bundle: bundle,
  watch: watch
};
