var async = require('async'),
    less = require('less'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

var apps = ['desktop'];

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

        var dir = 'build',
            paramsLess = { compress: false };
        if(env=='production') {
            dir = 'bin';
            paramsLess = { cleancss: true };
        }
        var basePath = 'dist/'+dir+'/'+appName+'/public';



        var parser = new(less.Parser)({
            paths: [],
            filename: 'app/'+appName+'/less/main.less' // Specify a filename, for better error messages
        });

        async.series([
            function(cb) {
                mkdirp(basePath, cb);
            },
            function(cb) {

                parser.parse(fs.readFileSync('app/'+appName+'/less/main.less').toString(), function (e, tree) {
                    if(e) return console.log(e);
                    fs.writeFile(basePath+'/main.css', tree.toCSS(paramsLess), cb);
                });
            }
        ], cb)



    }
};
var build = module.exports;