var gulp = require('gulp'),
livereload = require('gulp-livereload'),
del = require('del');

var //gulpLogger = require(__dirname+'/oldlogger'),
server = require(__dirname+'/../../../server/server'),
logger = require(__dirname+'/../../../logger/logger'),
frontendBuild = require(__dirname+'/frontend/build'),
frontendCompile = require(__dirname+'/frontend/compile'),
backend = require(__dirname+'/old/backend'),
beautifier = require(__dirname+'/old/beautifier'),
loadTasks = require(__dirname+'/loadTasks');


var config = require(__dirname+'/../../../config');


var frontendApps = config.frontend.list(),
builds = ['build@backend'],
compiles = [];
frontendApps.forEach(function(app) {
    builds.push('build@'+app);
    compiles.push('compile@'+app);
});

var async = require('async'),
slug = require('slug');





process.on('message',function(data){


    console.log(data);
    logger.log('Building ', 'development', ['yellow'], ' files.');
    loadTasks(data.debug);

    gulp.start(builds, function() {
        logger.log('Building ', 'production', ['yellow'], ' files.');
        gulp.start(compiles, function() {
            del(['dist/build'], function () {
                logger.log('Building production done. Execute ', 'node cli.js server-prod', ['yellow'], ' to try it.');
                process.send({
                    type: 'production_built'
                });
            });
        });
    });
});

process.on('uncaughtException',function(err){
    console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});