var async = require('async'),
    fse = require('fs-extra'),
    _ = require('underscore');

var logger = require(__dirname+'/../../../logger/logger'),
    config = require(__dirname+'/../../../config/config');


var apps = config.getFrontendApps();


module.exports = {
    build: function(params, cb) {

        async.each(apps, function(app, cb) {
            params.appName = app;
            i18n.buildApp(params, cb);
        }, function() {
            logger.info('i18n done.', { level: 3});
            cb();
        })
    },
    buildApp: function(params, cb) {
        var appName = params.appName,
            dest = 'dist/' +config.getDestDir(params)+'/'+appName+'/public/i18n';
        fse.copy('app/i18n', dest, cb);
    }

};
var i18n = module.exports;