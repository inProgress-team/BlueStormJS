var async = require('async'),
    less = require('less'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

var logger = require(__dirname+'/../../logger/logger');

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
                    if(e) {
                        var error = e.type+" error: "+ e.message+" on "+ e.filename
                            + " (line "+ e.line+", column "+ e.column+")\n";
                        e.extract.forEach(function(err) {
                            error+="\t"+err+"\n";
                        });
                        logger.error("Less generation", error, {stack:false});
                    }
                    else
                        fs.writeFile(basePath+'/main.css', tree.toCSS(paramsLess), cb);
                });
            }
        ], cb)



    }
};
var build = module.exports;