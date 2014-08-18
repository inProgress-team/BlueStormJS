var taskLoader = require(__dirname+'/taskLoader');

var async = require('async');

module.exports = function(json, env, cb) {
    if(typeof(json[0])=='object') {//2 levels
        async.eachSeries(json, function(group, cb) {
            async.each(group, function(task, cb) {
                taskLoader.load(task, env, cb);
            }, cb);
        }, cb);
    } else {//1 level
        async.each(json, function(task, cb) {
            taskLoader.load(task, env, cb)
        }, cb);
    }
};