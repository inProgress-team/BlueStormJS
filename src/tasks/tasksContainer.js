var fs = require('fs');

var watchConfig = require(process.cwd()+'/app/tasks/watch.json');

var tasksAvailable = fs.readdirSync(__dirname)
    .filter(function(dir) {
        if(dir.indexOf('.')==-1) return true;
    })
    .map(function(dir) {
        var path = __dirname+'/'+dir;
        return {
            name: dir,
            builder: fs.existsSync(path+'/build.js') ? require(path+'/build') : null
        }
    });

module.exports = {
    get: function(name) {
        var res = null;
        tasksAvailable.forEach(function(task) {
            if(task.name == name) {
                res = task;
            }
        });
        return res;
    },
    getWatchConfig: function(extension) {
        return watchConfig[extension] || null;
    }
};