var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var gulp_clean = require('gulp-clean');

var clean = function()
{
    var clean_folders = Object.keys(dest).map((k) => dest[k])
    return gulp.src(clean_folders, {read: false})
        .pipe(gulp_clean());
}

module.exports = {
    clean: clean
};
