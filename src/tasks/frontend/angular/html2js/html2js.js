var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir');

var logger = require(__dirname+'/../../../../logger/logger'),
    process = require(__dirname+'/process');


var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';


var apps = ['desktop', 'admin'];


module.exports = {
    buildDev: function(cb) {
        var dir ='build',
            file = 'dist/'+dir+'/app/templates.js';

        async.each(apps, function(app, cb) {
            html2js.build(app, file, function() {
                logger.info('HTML2JS done ('+app+').', {level: 3});
                cb();
            });
        }, cb);

    },
    buildProd: function(cb) {
        var dir ='bin',
            file = 'dist/'+dir+'/app/templates';

        async.each(apps, function(app, cb) {
            html2js.build(app, file, {prod:true}, function() {
                logger.info('HTML2JS done ('+app+').', {level: 3});
                cb();
            });
        }, cb);


    },
    getTemplatesFilename: function(appName, cb) {
        recursive('src', function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('/'+appName+'/')==-1) return false;
                if(file.indexOf('.tpl.html')!=-1) return true;
            });
            cb(null, files);
        });
    },
    build: function(appName, file, params, cb) {
        var files = [];
        file = file+"-"+appName+".js";

        if(cb===undefined) {
            cb = params;
            params = {};
        }
        var path = file.substring(0, file.lastIndexOf('/'));


        async.series([
            function(cb) {
                async.parallel([
                    function(cb) {
                        html2js.getTemplatesFilename(appName, function(err, filenames) {
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