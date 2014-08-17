var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp');

var minifier = require(__dirname+'/../html/minifier'),
    logger = require(__dirname+'/../../../logger/logger');;

var TEMPLATE = '   $templateCache.put(\'%s\',\n    \'%s\');\n';
var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';



module.exports = {
    buildDev: function(cb) {
        var dir ='build',
            file = 'dist/'+dir+'/src/templates.js';

        html2js.build(file, function() {
            logger.info('HTML2JS Done.');
            cb(file);
        });

    },
    buildProd: function(cb) {
        var dir ='bin',
            file = 'dist/'+dir+'/src/templates.js';

        html2js.build(file, {prod:true}, function() {
            cb(file);
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
                        //get list of files
                        files = ['src/home/desktop/home.tpl.html', 'src/home/desktop/test.tpl.html'];
                        cb()
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
            html2js.processFile(path, params, function(err, file) {
                if(err) return cb(err)
                content+=file;
                cb();
            });
        }, function(err) {
            if(err) return cb(err);
            cb(null, content);
        });
    },
    processFile: function(path, params, cb) {
        if(cb===undefined) {
            cb = params;
            params = {};
        }
        fs.readFile(path, function(err, content) {
            if(err) return cb(err);
            content = content.toString();
            if(params.prod) {//if prod, minify
                content = minifier.compress(content)
            }
            var res = util.format(TEMPLATE, path, html2js.escapeContent(content));
            cb(null, res);
        });
    },
    escapeContent: function(content) {
        return content.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n\' +\n    \'');
    }
};
var html2js = module.exports;