// Include gulp
var gulp        = require('gulp-help')(require('gulp'));

// Include build-tasks
var browserify  = require('./build-tasks/browserify');
var clean       = require('./build-tasks/clean');
var server      = require('./build-tasks/server');
var statics     = require('./build-tasks/statics');
var surge       = require('./build-tasks/surge');
var typescript  = require('./build-tasks/typescript');
var uglify      = require('./build-tasks/uglify');

// Sub-tasks
gulp.task('server:reload', "Reload the attached browsers", server.reload);
gulp.task('server:serve', false, ['compile'], server.serve);

gulp.task('statics:compile', "Compile statics (html, css) sources", statics.compile);
gulp.task('statics:watch', false, statics.watch);

gulp.task('typescript:compile', "Compile typescript sources", typescript.compile);
gulp.task('typescript:watch', false, typescript.watch);

gulp.task('browserify:bundle', false, browserify.bundle);
gulp.task('browserify:compile', "Bundle js sources", ['typescript:compile'], browserify.compile);
gulp.task('browserify:watch', ['typescript:watch'], browserify.watch);

gulp.task('uglify:compress', ['browserify:compile'], uglify.compress);

// Accumulative tasks
gulp.task('compile', "Compile everything", [
    'statics:compile',
    'typescript:compile',
    'browserify:compile'
]);

gulp.task('watch', false, [
    'statics:watch',
    'typescript:watch',
    'browserify:watch'
]);

gulp.task('predeploy', false, ['uglify:compress', 'statics:compile'], surge.clean);
gulp.task('deploy', "Deploy the project to Surge.sh", ['predeploy'], surge.deploy);

gulp.task('clean', "Cleans up the build environment", clean.clean);

gulp.task('build', "Compile and watch for changes", ['compile', 'watch']);

gulp.task('serve', "Compile and serve the project", ['server:serve']);

gulp.task('browser', "Serve project watching for changes", ['serve', 'watch']);

gulp.task('default', ["browser"]);
