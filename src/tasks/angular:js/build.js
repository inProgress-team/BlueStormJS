var async = require('async'),
    less = require('less'),
    fs = require('fs'),
    fse = require('fs-extra'),
    mkdirp = require('mkdirp');
var recursive = require('recursive-readdir');


var logger = require(__dirname+'/../../logger/logger'),
    config = require(__dirname+'/../../config/config');

var apps = ['desktop'];//TODOFRAM

module.exports = {
    development: function(cb) {
        build.build('development', cb);
    },
    production: function(cb) {
        build.build('production', cb);
    },
    build: function(env, cb) {
        async.each(apps, function(appName, cb) {
            build.buildApp(env, appName, cb);
        }, cb);
    },
    buildApp: function(env, appName, cb) {
        var dir = 'build';
        if(env=='production') {
            dir = 'bin';
        }
        async.parallel([
            function(cb) {
                //copy src files
                build.getFiles('src', appName, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        fse.copy(file, 'dist/'+dir+'/'+appName+'/public/'+file, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy app/common files
                build.getFiles('app/common', appName, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        fse.copy(file, 'dist/'+dir+'/'+appName+'/public/'+file, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy app/{appname} files
                build.getFiles('app/'+appName, appName, function(err, files) {
                    if(err) return cb(err);
                    async.each(files, function(file, cb) {
                        var dest = file.replace('/'+appName, '');
                        fse.copy(file, 'dist/'+dir+'/'+appName+'/public/'+dest, cb);
                    }, cb);
                });
            },
            function(cb) {
                //copy bower_components files
                var files = config.getFrontendBowerComponents(env, appName);
                async.each(files, function(file, cb) {
                    var dest = file;
                    fse.copy(file, 'dist/'+dir+'/'+appName+'/public/'+dest, cb);
                }, cb);
            }
        ], cb);


    },
    getFiles: function(dir, appName, cb) {
        recursive(dir, function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+appName+'/')==-1 && dir!='app/common') return false;
                if(file.indexOf('.js')!=-1 && file.indexOf('.json')==-1) return true;
            });
            cb(null, files);
        });
    }
};
var build = module.exports;