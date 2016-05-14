var gutil = require('gulp-util');
var clc = require('cli-color');

var glup_fakerun = function(taskname)
{
    var taskname = clc.cyan(taskname);
    var time = clc.magenta('0 ms');

    gutil.log("Starting '" + taskname + "'... (fake)");
    gutil.log("Finished '" + taskname + "' after " + time + " (fake)");
}

module.exports = {
    glup_fakerun: glup_fakerun
};
