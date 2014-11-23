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
    logger.log('Starting ', 'development', ['yellow'], ' mode.');
    loadTasks(data.debug);
    var first = true;
    gulp.start('watch', function() {
        /*if(first) {
            var d = data.debug;
            server.supervisor.development(d);
        }
        first = false;*/
    });
});

process.on('uncaughtException',function(err){
    console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});