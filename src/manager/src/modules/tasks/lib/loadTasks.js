
var gulp = require('gulp'),
livereload = require('gulp-livereload'),
del = require('del'),
async = require('async'),
slug = require('slug');

var gulpLogger = require(__dirname+'/old/logger'),
server = require(__dirname+'/../../../../../server/server'),
logger = require(__dirname+'/../../../../../logger/logger'),
frontendBuild = require(__dirname+'/frontend/build'),
frontendCompile = require(__dirname+'/frontend/compile'),
beautifier = require(__dirname+'/old/beautifier'),
gulpOld = require(__dirname+'/old/gulp');


var config = require(__dirname+'/../../../../../config');


var frontendApps = config.frontend.list();




module.exports = function(data) {

    gulpLogger.gulp(gulp, data.debug);
    console.log(data);
    var apps;
    if(data.apps) {
        apps = data.apps;
    } else {
        apps = frontendApps;    
    }

    var builds = [],
    compiles = [];

    apps.forEach(function(app) {
        frontendBuild(app);
        frontendCompile(app);
        builds.push('build@'+app);
        compiles.push('compile@'+app);
    });
    console.log(builds);

    gulp.task('watch', builds, function() {
        var options = {};
        if(!data.debug) options.silent = true;
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