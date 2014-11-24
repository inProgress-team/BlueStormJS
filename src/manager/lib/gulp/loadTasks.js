
var gulp = require('gulp'),
livereload = require('gulp-livereload'),
del = require('del'),
async = require('async'),
slug = require('slug');

var gulpLogger = require(__dirname+'/old/logger'),
server = require(__dirname+'/../../../server/server'),
logger = require(__dirname+'/../../../logger/logger'),
frontendBuild = require(__dirname+'/frontend/build'),
frontendCompile = require(__dirname+'/frontend/compile'),
beautifier = require(__dirname+'/old/beautifier'),
gulpOld = require(__dirname+'/old/gulp');


var config = require(__dirname+'/../../../config');


var frontendApps = config.frontend.list(),
builds = [],
compiles = [];
frontendApps.forEach(function(app) {
    builds.push('build@'+app);
    compiles.push('compile@'+app);
});


module.exports = function(debug) {

    gulpLogger.gulp(gulp, debug);

    frontendApps.forEach(function(app) {
        frontendBuild(app);
        frontendCompile(app);
    });

    gulp.task('watch', builds, function() {
        var options = {};
        if(!debug) options.silent = true;
        livereload.listen(options);
        var w = gulp.watch('dist/build/**/*', function(file) {
            livereload.changed(file.path);
        });

        process.on('SIGHUP', function(msg) {
            if(w) {
                w.end();
            }
        });
    });
};