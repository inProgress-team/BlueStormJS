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
        async.parallel([
            function(cb) {
                //copy src files
                copy.getFiles('src', params, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        fse.copy(file, 'dist/'+config.getDestDir(params)+'/'+params.appName+'/public/'+file, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy src files
                copy.getFiles('app/common', params, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        fse.copy(file, 'dist/'+config.getDestDir(params)+'/'+params.appName+'/public/'+file, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy app files
                copy.getFiles('app/'+params.appName, params, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        var dest = file.replace('/'+params.appName, '');
                        fse.copy(file, 'dist/'+config.getDestDir(params)+'/'+params.appName+'/public/'+dest, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy app files
                var files = config.getFrontendBowerComponents(params);
                async.each(files, function(file, cb) {
                    var dest = file;
                    fse.copy(file, 'dist/'+config.getDestDir(params)+'/'+params.appName+'/public/'+dest, cb);
                }, cb);
            }
        ], cb);


    },
    getFiles: function(dir, params, cb) {
        recursive(dir, function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+params.appName+'/')==-1 && dir!='app/common') return false;
                if(file.indexOf('.js')!=-1 && file.indexOf('.json')==-1) return true;
            });
            cb(null, files);
        });
    }
};
var copy = module.exports;