var async = require('async'),
    less = require('less'),
    fs = require('fs'),
    fse = require('fs-extra'),
    mkdirp = require('mkdirp');
var recursive = require('recursive-readdir');


var logger = require(__dirname+'/../../logger/logger'),
    config = require(__dirname+'/../../config/config'),
    process = require(__dirname+'/process');


var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';


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
        var files = [],
            path = 'dist/'+dir+'/'+appName+'/public',
            file = path+'/templates.js';


        async.series([
            function(cb) {
                async.parallel([
                    function(cb) {
                        build.getTemplatesFilename(appName, function(err, filenames) {
                            files = filenames;
                            cb();
                        })

                    },
                    function(cb) {
                        //create directories
                        mkdirp(path, cb);
                    }
                ], cb);
            },
            function(cb) {
                //write HEADER
                fs.writeFile(file, HEADER, cb);

            },
            function(cb) {
                //WRITE EACH FILE
                process.appendTemplates(files, {
                    env: env,
                    appName: appName
                }, function(err, content) {
                    if(err) throw err;
                    fs.appendFile(file, content, cb);
                });

            },
            function(cb) {
                //write FOOTER
                fs.appendFile(file, FOOTER, cb);

            }
        ], cb);

    },
    getTemplatesFilename: function(appName, cb) {
        var filenames = [];
        var dirs = ['src', 'app'];
        async.each(dirs, function(dir, cb) {
            build.recursive(dir, appName, function(err, files) {
                if(err) return console.log(err);

                files.forEach(function(file) {
                    filenames.push(file)
                });
                cb();
            });
        }, function(err) {
            if(err) return console.log(err);
            cb(null, filenames);
        })

    },
    recursive: function(dir, appName, cb) {
        recursive(dir, function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+appName+'/')==-1 && dir!='app') return false;
                if(file.indexOf('.tpl.html')!=-1) return true;
            });
            cb(null, files);
        });
    }
};
var build = module.exports;