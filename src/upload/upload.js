var fs = require('fs'),
    fse = require('fs.extra'),
    async = require('async'),
    uuid = require('node-uuid');

var config = require(__dirname + '/../config');

var basePath = process.cwd()+'/dist/build/';

module.exports = {
    addPublic: function(file, apps, callback) {
        var hash = uuid.v4();
        var name = file.originalname;
        var ext = file.extension;

        if (ext && ext != '') {
            ext = '.' + ext;
            name = name.substring(0, name.length - ext.length + 1);
        }

        if (typeof apps == 'function') {
            callback = apps;
            apps = [];
        }

        if (!apps || apps.length == 0)
            apps = config.frontend.list();

        async.each(apps, function(app, callback) {
            fse.mkdirp(basePath + app + '/public/upload', function(err) {
                if (err)
                    return callback(err);

                var destination = basePath + app + '/public/upload/' + name + hash + ext;
                fs.unlink(destination, function() {
                    fse.copy(file.path, destination, function(err) {
                        return callback(err);
                    });
                });
            });
        }, function(err) {
            if (err)
                return callback(err);

            fs.unlink(file.path, function(err) {
                return callback(err, '/public/upload/' + name + hash + ext);
            });
        });
    },
    removePublic: function(relativePath, apps, callback) {
        if (typeof apps == 'function') {
            callback = apps;
            apps = [];
        }

        if (!apps || apps.length == 0)
            apps = config.frontend.list();

        async.parallel(apps, function(app, callback) {
            var path = basePath + apps[i] + relativePath;
            fs.unlink(path, function(err) {
                return callback(err);
            });
        }, function(err) {
            return callback(err);
        });
    }
};