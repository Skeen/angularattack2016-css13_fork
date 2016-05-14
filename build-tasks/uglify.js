var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
 
function compress()
{
    return gulp.src(dest.js + "bundle.js")
               .pipe(uglify())
               .pipe(gulp.dest(dest.js));
}

module.exports = {
  compress: compress
};
