var gulp        = require('gulp');
var gulp_config = require('../gulp-config');

var surge       = require('gulp-surge')
var fs          = require('fs');

var src         = gulp_config.paths.sources;
var dest        = gulp_config.paths.destinations;

var deploy = function()
{
    var cname = fs.readFileSync("CNAME", "utf8");
    return surge({
        project: dest.dist,
        domain: cname
    })
}

module.exports = {
  deploy: deploy
};
