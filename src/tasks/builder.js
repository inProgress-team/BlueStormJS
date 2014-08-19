var async = require('async'),
    fs = require('fs');

var tasksContainer = require(__dirname+'/tasksContainer'),
    logger = require(__dirname+'/../logger/logger');


module.exports = {
    build: function(env, cb) {
        var start = new Date;

        logger.info('Building files for '+env+' environnement...', {level: 2});
        builder.parse(process.cwd()+'/app/tasks/tasks.json', env, function() {
            var sec = (new Date - start)/1000;
            logger.info('Building files done ('+sec+' seconds).', {level: 2});
            cb();
        });
    },
    load: function(name, env, cb) {
        var task = tasksContainer.get(name);

        if(!task || typeof task.builder[env] !='function') {cb();return console.log(name+' task not found.');}

        task.builder[env](function(err) {
            if(err) return logger.error("Builder "+name, err);
            logger.info(name+' done.', { level: 3});
            cb();
        });


    },
    parse: function(path, env, cb) {
        var json = require(path)[env];
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