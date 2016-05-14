var gulp        = require('gulp');
var gulp_config = require('../gulp-config');
var gutil		= require('gulp-util');
var clc			= require('cli-color');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var tsc     = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var merge   = require('merge2');

var tsProject = tsc.createProject(opts.typescript);

// Compile everything
var compile = function()
{
	var mesg = clc.green('Found file changes.');
	gutil.log(mesg);
	var tsResult = gulp.src(src.typescript)
                       .pipe(sourcemaps.init())
                       .pipe(tsc(tsProject));

	return merge([
		tsResult.dts.pipe(gulp.dest(dest.ts)),
        tsResult.js.pipe(sourcemaps.write())
                   .pipe(gulp.dest(dest.ts))
    ]);
}

// Incremental compilation
var watch = function()
{
    // typescript:compile is incremental
    gulp.watch(src.typescript, ['typescript:compile']);
};

module.exports = {
  compile: compile,
  watch: watch
};
