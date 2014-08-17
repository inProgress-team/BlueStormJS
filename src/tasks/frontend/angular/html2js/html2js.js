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
    build: function(env, cb) {
        var dir ='build';
        if(env=='production') {
            dir = 'bin';
        }

        async.each(apps, function(app, cb) {
            html2js.buildFile(env, app, 'dist/'+dir+'/'+app+'/public/templates.js', function() {
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
    buildFile: function(env, appName, file, cb) {
        var files = [],
            path = file.substring(0, file.lastIndexOf('/'));


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
                process.appendTemplates(env, files, function(err, content) {
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