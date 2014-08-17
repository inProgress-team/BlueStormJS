var async = require('async'),
    fs = require('fs'),
    _ = require('underscore');

var logger = require(__dirname+'/../../../logger/logger'),
    config = require(__dirname+'/../../../config/config');


var apps = config.getFrontendApps();

module.exports = {
    build: function(params, cb) {
        async.each(apps, function(app, cb) {
            params.appName = app;
            index.buildFile(params, cb);
        }, function() {
            logger.info('Process index.html done.', {level: 3});
            cb();
        });
    },
    buildFile: function(param, cb) {
        var params = _.clone(param),
            includes = [],
            content = '';

        async.parallel([
            function(cb) {
                //get filenames to be include
                config.getIncludes(params, function(err, inc) {
                    if(err) return cb(err);
                    includes = inc;
                    cb();
                });
            },
            function(cb) {
                fs.readFile('app/'+params.appName+'/index.html', function(err, file) {
                    if(err) return cb(err);
                    content = file.toString();
                    cb();
                });
            }
        ], function() {
            content = content.replace('<% include %>', includes);
            fs.writeFile('dist/'+config.getDestDir(params)+'/'+params.appName+'/main.html', content, cb);
        });


    }
};
var index = module.exports;