var fs = require('fs'),
    async = require('async');

var basePath = process.cwd()+'/src/modules/';

module.exports = {
    getRequiredFiles: function (type, callback) {
        //get all modules;
        var dirs = fs.readdirSync(basePath),
            files = [];
        //get all files of the good type and require them
        async.each(dirs, function (dir, cb) {
            var path = basePath+dir+'/'+type;

            fs.exists(path,function(exists){
                if(exists) {
                    var filesFound = fs.readdirSync(path);
                    filesFound.forEach(function (file) {
                        files.push(require(path+'/'+file));
                    })
                    
                }
                cb();
            });
        }, function() {
            callback(files);
        });
    },
    getFiles: function (type, callback) {
        //get all modules;
        var dirs = fs.readdirSync(basePath),
            files = [];

        //get all files of the good type and require them
        async.each(dirs, function (dir, cb) {
            var path = basePath+dir+'/'+type,
                file = fs.readdirSync(path);
            files.push(path+'/'+file);
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