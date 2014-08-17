var recursive = require('recursive-readdir');
var async = require('async'),
    fs = require('fs'),
    fse = require('fs-extra'),
    _ = require('underscore');

var logger = require(__dirname+'/../../../../logger/logger'),
    config = require(__dirname+'/../../../../config/config');


var apps = config.getFrontendApps();


module.exports = {
    build: function(param, cb) {
        async.each(apps, function(app, cb) {
            var params = _.clone(param);
            params.appName = app;
            copy.buildFiles(params, cb);
        }, function() {
            logger.info('Copy js files done.', {level: 3});
            cb();
        });
    },
    buildFiles: function(params, cb) {
        copy.getFiles(params, function(err, files) {
            if(err) return cb(err);
            async.each(files, function(file, cb) {
                fse.copy(file, 'dist/'+config.getDestDir(params)+'/'+params.appName+'/public/'+file, cb);
            }, cb);
        });
    },
    getFiles: function(params, cb) {
        recursive('src', function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+params.appName+'/')==-1) return false;
                if(file.indexOf('.js')!=-1) return true;
            });
            cb(null, files);
        });
    }
};
var copy = module.exports;