var watch = require('node-watch'),
    fs = require('fs'),
    async = require('async');

var logger = require(__dirname+'/../logger/logger'),
    tasksContainer = require(__dirname+'/tasksContainer'),
    server = require(__dirname+'/../server/server'),
    builder = require(__dirname+'/builder'),
    livereload = require(__dirname+'/livereload/livereload');

//TODOFRAM
var excluded = ['app/tasks', 'app/config'];

module.exports = {
    watch: function() {
        logger.log('And now my Watch begins.');
        watch(['src', 'app'], function(filename) {
            var emit = true;
            excluded.forEach(function(exclude) {
                if(filename.indexOf(exclude)!=-1) {
                    emit=false;
                }
            });
            if(emit) watcher.onWatch(filename);
        });
        livereload.start();
    },
    onWatch: function(filename) {
        if(server.monitor && (filename.indexOf('src/')!=-1 && (filename.indexOf('/sockets/') != -1 || filename.indexOf('/api/') != -1))) {
            server.monitor.restart();
            return;
        }


        var config = tasksContainer.getWatchConfig(getExtension(filename));
        if(!config) return console.log('No watch for '+filename);
        //get tasks
        var updates = [],
            deletes = [];
        if(config.updatedelete) {
            config.updatedelete.forEach(function(task) {
                updates.push(task);
                deletes.push(task);
            });
        }

        fs.exists(filename, function(exists) {
            //if it doesn't exist, load a watch : on delete
            var tasks,
                message = 'File '+filename;
            if(!exists) {
                tasks = deletes;
                message+=' deleted.';
            } else {
                tasks = updates;
                message+=' updated.';
            }
            logger.log(message);

            async.each(tasks, function(task, cb) {
                task.filename = filename;
                if(!task.dir || filename.indexOf(task.dir)==0)//we check the dir var
                    builder.load(task, 'development', cb);
            }, function() {
                logger.log('Done.');
                livereload.reload();
            });
        });

    }
};
var watcher = module.exports;



var getExtension = function (filename) {
    var name = filename.slice(filename.lastIndexOf('/'));
    return name.slice(name.indexOf('.')+1);
};