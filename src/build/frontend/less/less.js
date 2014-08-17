var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir'),
    less = require('less');

var logger = require(__dirname+'/../../../logger/logger'),
    config = require(__dirname+'/../../../config/config');



var apps = config.getFrontendApps();


module.exports = {
    build: function(env, cb) {
        async.each(apps, function(app, cb) {
            service.buildFile(env, app, cb);
        }, function() {
            logger.info('LESS done.', {level:3});
            cb();
        });
    },
    buildFile: function(env, appName, cb) {

        var dir = 'build',
            paramsLess = { compress: false };
        if(env=='production') {
            dir = 'bin';
            paramsLess = { cleancss: true };
        }
        var basePath = 'dist/'+dir+'/'+appName+'/public';



        var parser = new(less.Parser)({
            paths: ['app/theme/theme-blue'], // search @import directives
            filename: 'app/'+appName+'/less/main.less' // Specify a filename, for better error messages
        });

        async.series([
            function(cb) {
                mkdirp(basePath, cb);
            },
            function(cb) {

                parser.parse(fs.readFileSync('app/'+appName+'/less/main.less').toString(), function (e, tree) {
                    fs.writeFile(basePath+'/main.css', tree.toCSS(paramsLess), cb);
                });
            }
        ], cb)



    }

};
var service = module.exports;