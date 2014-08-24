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
    development: function(cb) {""
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
        fse.copy('app/assets', 'dist/'+dir+'/'+appName+'/public/assets', cb);
    }
};
var build = module.exports;