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

        var includes = [],
            content = '';

        async.parallel([
            function(cb) {
                //get filenames to be include
                config.getIncludes({
                    appName:appName,
                    env: env
                }, function(err, inc) {
                    if(err) return cb(err);
                    includes = inc;
                    cb();
                });
            },
            function(cb) {
                fs.readFile('app/'+appName+'/index.html', function(err, file) {
                    if(err) return cb(err);
                    content = file.toString();
                    cb();
                });
            }
        ], function(err) {
            if(err)return console.log(err);
            content = content.replace('<% include %>', includes);
            fs.writeFile('dist/'+dir+'/'+appName+'/main.html', content, cb);
        });

    }
};
var build = module.exports;