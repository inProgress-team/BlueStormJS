var async = require('async'),
    fs = require('fs');

var tasksContainer = require(__dirname+'/tasksContainer'),
    logger = require(__dirname+'/../logger/logger');

var buildConfig = require(process.cwd()+'/app/tasks/build.json');

var apps = ['desktop'];//TODOFRAM

module.exports = {
    build: function(env, cb) {
        var start = new Date;

        logger.log('Building files for '+env+' environnement...');
        builder.parse(env, function() {
            var sec = (new Date - start)/1000;
            logger.log('Buildi ('+sec+' seconds).');
            cb();
        });
    },
    getFrontendApp: function(filename) {
        var res = false;
        apps.forEach(function(app) {
            if(filename.indexOf('/'+app+'/')!=-1) {
                res = app;
                return;
            }
        });
        return res;
    },
    load: function(taskConfig, env, cb) {
        if(typeof taskConfig == "string")  taskConfig = { name: taskConfig };

        var task = tasksContainer.get(taskConfig.name);
        //if task has not been found
        if(!task || typeof task.builder[env] !='function') {cb();return console.log(taskConfig.name+' task not found.');}

        //CALLBACK WHEN A TASK IS DONE
        var callback = function(err, message) {
            if(err) return logger.error("Builder "+taskConfig.name, err);
            logger.log(message);
            cb();
        };


        /**
         * Load a buildApp if the task is called by app
         */
        if(taskConfig.filename
            && builder.getFrontendApp(taskConfig.filename)
            && taskConfig.filters
            && taskConfig.filters.indexOf("frontendapp")!=-1) {

            var app = builder.getFrontendApp(taskConfig.filename);
            task.builder.buildApp(env, app, function(err) {
                callback(err, taskConfig.name+' done. ('+app+')');
            });
        } else {
            /**
             * Load everything for an environnement
             */
            task.builder[env](function(err) {
                callback(err, taskConfig.name+' done. ')
            });
        }
    },
    parse: function(env, cb) {
        var json = buildConfig[env];
        if(typeof(json[0])=='object') {//2 levels

            async.eachSeries(json, function(group, cb) {
                async.each(group, function(task, cb) {
                    builder.load(task, env, cb);
                }, cb);
            }, cb);

        } else {//1 level
            async.each(json, function(task, cb) {
                builder.load(task, env, cb)
            }, cb);
        }
    }
};
var builder = module.exports;