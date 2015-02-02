var gulp = require('gulp'),
del = require('del');

var loadTasks = require(__dirname+'/loadTasks'),
    config = require(__dirname+'/../config');


var frontendApps = config().frontend.list(),
builds = [],
compiles = [];
frontendApps.forEach(function(app) {
    builds.push('build@'+app);
    compiles.push('compile@'+app);
});

var async = require('async'),
slug = require('slug');





process.on('message',function(data){


    console.log(data);
    console.log('Building development files.');
    loadTasks(data.debug);

    gulp.start(builds, function() {
        console.log('Building ', 'production', ['yellow'], ' files.');
        gulp.start(compiles, function() {
            del(['dist/build'], function () {
                console.log('Building production done. Execute ', 'node cli.js server-prod', ['yellow'], ' to try it.');
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