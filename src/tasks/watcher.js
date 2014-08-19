var watch = require('node-watch'),
    fs = require('fs');

var logger = require(__dirname+'/../logger/logger'),
    tasksContainer = require(__dirname+'/tasksContainer');

module.exports = {
    watch: function() {
        logger.info('And now my Watch begins.', {level:2})
        watch(['src', 'app'], function(filename) {
            watcher.onWatch(filename);
        });
    },
    onUpdate: function(filename) {
        console.log(extension(filename));
        console.log('updated ' + filename);
    },
    onDelete: function(filename) {
        console.log('deleted ' + filename);
    },
    onWatch: function(filename) {
        fs.exists(filename, function(exists) {
            if(!exists) return watcher.onDelete(filename);

            watcher.onUpdate(filename);
        });

    }
};
var watcher = module.exports;

var extension = function (filename) {
    var name = filename.slice(filename.lastIndexOf('/'));
    return name.slice(name.indexOf('.')+1);
}