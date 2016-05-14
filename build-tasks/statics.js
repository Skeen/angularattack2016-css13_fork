var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var glup_fakerun = require('./utils').glup_fakerun;

// Compile everything
var compile = function()
{
    return gulp.src(src.statics)
        .pipe(gulp.dest(dest.dist));
}

// Incremental compilation
var watch = function()
{
    var compile_file = function(file)
    {
        return gulp.src(file)
            .pipe(gulp.dest(dest.dist));
    }

    gulp.watch(src.statics).on('change', function(file)
    {
        // Fake output, so we can see the task was run
        glup_fakerun('statics:compile_file');
        compile_file(file.path);
    });
};

module.exports = {
  compile: compile,
  watch  : watch
};
