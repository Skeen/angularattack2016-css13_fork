var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var opts        = gulp_config.pluginOptions;
var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var browser_sync = require('browser-sync');

var reload = function()
{
    browser_sync.reload();
}

var serve = function() 
{
    browser_sync(opts.browser_sync);
    // Watch for changes in the output directory
    return gulp.watch(dest.dist + '**', ["server:reload"]);
};

module.exports = {
  serve: serve,
  reload: reload
};
