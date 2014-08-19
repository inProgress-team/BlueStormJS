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
    /*
    buildApp: function(env, appName, cb) {

        var dir = 'build',
            appNameLess = { compress: false };
        if(env=='production') {
            dir = 'bin';
            appNameLess = { cleancss: true };
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
                        fs.writeFile(basePath+'/main.css', tree.toCSS(appNameLess), cb);
                });
            }
        ], cb)



    }*/
};
var build = module.exports;