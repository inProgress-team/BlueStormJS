var fs = require('fs'),
    async = require('async');

var basePath = process.cwd()+'/src/';

module.exports = {
    getFiles: function (type, callback) {
        //get all modules;
        var dirs = fs.readdirSync(basePath),
            files = [];

        //get all files of the good type and require them
        async.each(dirs, function (dir, cb) {
            var path = basePath+dir+'/'+type,
                file = fs.readdirSync(path);
            files.push(require(path+'/'+file));
            cb();
        }, function() {
            callback(files);
        });
    },
    loadFiles: function(files, app) {
        files.forEach(function(file) {
            file(app);
        });
    }
};