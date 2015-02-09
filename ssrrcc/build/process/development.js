var gulp = require('gulp');

var loadTasks = require(__dirname+'/loadTasks'),
    config = require(__dirname+'/../../config');


var async = require('async'),
slug = require('slug');

process.on('message',function(data){
    console.log('Starting ', 'development', ['yellow'], ' mode.');
    loadTasks(data);
    var first = true;
    gulp.start('watch', function() {
        console.log('watch ready');
    });
});

process.on('uncaughtException',function(err){
    console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});