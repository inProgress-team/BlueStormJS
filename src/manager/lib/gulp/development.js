var gulp = require('gulp'),
livereload = require('gulp-livereload'),
del = require('del');

var //gulpLogger = require(__dirname+'/oldlogger'),
server = require(__dirname+'/../../../server/server'),
logger = require(__dirname+'/../../../logger/logger'),
frontendBuild = require(__dirname+'/frontend/build'),
frontendCompile = require(__dirname+'/frontend/compile'),
beautifier = require(__dirname+'/old/beautifier'),
loadTasks = require(__dirname+'/loadTasks');


var config = require(__dirname+'/../../../config');


var async = require('async'),
slug = require('slug');

process.on('message',function(data){
    console.log(data);
    logger.log('Starting ', 'development', ['yellow'], ' mode.');
    loadTasks(data.debug);
    var first = true;
    gulp.start('watch', function() {
        if(first) {

            process.send({
                type: 'start_server_request'
            });
            first = false;
        }
        console.log('watch done');
    });
});

process.on('uncaughtException',function(err){
    console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});