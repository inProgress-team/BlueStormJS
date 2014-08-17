var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir');

var logger = require(__dirname+'/../../../../logger/logger'),
    process = require(__dirname+'/process');


var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';



module.exports = {
    buildDev: function(cb) {
        var dir ='build',
            file = 'dist/'+dir+'/src/templates.js';

        html2js.build(file, function() {
            logger.info('HTML2JS Done.', null, 2);
            cb(null, file);
        });

    },
    buildProd: function(cb) {
        var dir ='bin',
            file = 'dist/'+dir+'/src/templates.js';

        html2js.build(file, {prod:true}, function() {
            logger.info('HTML2JS Done.', null, 2);
            cb(file);
        });
    },
    getTemplatesFilename: function(cb) {
        recursive('src', function (err, files) {
            if(err) return cb(err);
            files = files.filter(function(file) {
                if(file.indexOf('.tpl.html')!=-1) return true;
            });
            cb(null, files);
        });
    },
    build: function(file, params, cb) {
        var files = [];

        if(cb===undefined) {
            cb = params;
            params = {};
        }
        var path = file.substring(0, file.lastIndexOf('/'));

        async.series([
            function(cb) {
                async.parallel([
                    function(cb) {
                        html2js.getTemplatesFilename(function(err, filenames) {
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
                html2js.appendTemplates(files, params, function(err, content) {
                    if(err) throw err;
                    fs.appendFile(file, content, cb);
                });

            },
            function(cb) {
                //write FOOTER
                fs.appendFile(file, FOOTER, cb);

            }
        ], cb);
    },
    appendTemplates: function(files, params, cb) {
        if(cb===undefined) {
            cb = params;
            params = {};
        }
        var content = "";
        async.each(files, function(path, cb) {
            process.processFile(path, params, function(err, file) {
                if(err) return cb(err)
                content+=file;
                cb();
            });
        }, function(err) {
            if(err) return cb(err);
            cb(null, content);
        });
    },

};
var html2js = module.exports;