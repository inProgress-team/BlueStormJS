var co = require('co'),
    fs = require('co-fs');

var basePath = process.cwd()+'/src/';

module.exports = {
    getFiles: function *(type, params) {
        //get all modules;
        var dirs = yield fs.readdir(basePath);

        //get all files of the good type and require them
        var files = yield dirs.map(function * (dir) {
            var path = basePath+dir+'/'+type,
                file = yield fs.readdir(path);
            require(path+'/'+file)(params.app);
            return path+'/'+file;
        });
        console.log('a');
        console.log(files);
        return files;
    }
};