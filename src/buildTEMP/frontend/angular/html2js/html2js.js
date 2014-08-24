var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir'),
    _ = require('underscore');

var logger = require(__dirname+'/../../../../logger/logger'),
    config = require(__dirname+'/../../../../config/config'),
    process = require(__dirname+'/process');


var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';


var apps = config.getFrontendApps();


module.exports = {
    build: function(param, cb) {
        var dir = config.getDestDir(param);

        async.each(apps, function(app, cb) {
            var params = _.clone(param);
            params.appName = app;
            html2js.buildFile('dist/'+dir+'/'+app+'/public/templates.js', params, cb);
        }, function() {
            logger.info('HTML2JS done.', {level: 3});
            cb();
        });

    },
    getTemplatesFilename: function(params, cb) {
        var filenames = [];
        async.parallel([
            function(cb) {
                html2js.recursive('src', params, function(err, files) {
                    if(err) return console.log(err);

                    files.forEach(function(file) {
                        filenames.push(file)
                    });
                    cb();
                });
            },
            function(cb) {
                html2js.recursive('app', params, function(err, files) {
                    if(err) return console.log(err);

                    files.forEach(function(file) {
                        filenames.push(file)
                    })
                    cb()
                });
            }
        ], function(err) {
            if(err) return console.log(err);
            cb(null, filenames);
        })

    },
    recursive: function(dir, params, cb) {
        recursive(dir, function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+params.appName+'/')==-1 && dir!='app') return false;
                if(file.indexOf('.tpl.html')!=-1) return true;
            });
            cb(null, files);
        });
    },
    buildFile: function(file, params, cb) {
        var files = [],
            path = file.substring(0, file.lastIndexOf('/'));


        async.series([
            function(cb) {
                async.parallel([
                    function(cb) {
                        html2js.getTemplatesFilename(params, function(err, filenames) {
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
                process.appendTemplates(files, params, function(err, content) {
                    if(err) throw err;
                    fs.appendFile(file, content, cb);
                });

            },
            function(cb) {
                //write FOOTER
                fs.appendFile(file, FOOTER, cb);

            }
        ], cb);
    }

};
var html2js = module.exports;