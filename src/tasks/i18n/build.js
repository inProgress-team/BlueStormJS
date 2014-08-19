var async = require('async'),
    fse = require('fs-extra');

var logger = require(__dirname+'/../../logger/logger');

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

        var dest = 'dist/' +dir+'/'+appName+'/public/i18n';
        fse.copy('app/i18n', dest, cb);

    }
};
var build = module.exports;