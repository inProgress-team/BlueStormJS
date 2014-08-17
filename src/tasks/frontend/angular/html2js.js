


var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp');

var minifier = require(__dirname+'/htmlminifier');

var TEMPLATE = '   $templateCache.put(\'%s\',\n    \'%s\');\n';
var HEADER = 'angular.module(\'templates\', []).run(function($templateCache) {\n',
    FOOTER = '});\n';




module.exports = {
    buildDev: function(cb) {
        var basePath = 'dist/build/src';
        html2js.build(basePath+'/test.js', ['src/home/desktop/home.tpl.html', 'src/home/desktop/test.tpl.html'], function() {
            console.log('done');
        });

    },
    buildProd: function(cb) {
        this.processFile('src/home/desktop/home.tpl.html', {prod:true}, function(err, file) {
            console.log(file);
            cb();
        });
    },
    build: function(file, files, cb) {
        var path = file.substring(0, file.lastIndexOf('/'));
        console.log(path);
        async.series([
            function(cb) {
                //create directories
                mkdirp(path, cb);
            },
            function(cb) {
                //write HEADER
                fs.writeFile(file, HEADER, cb);

            },
            function(cb) {
                html2js.appendTemplates(files, function(err, content) {
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
    appendTemplates: function(files, cb) {
        var content = "";
        async.each(files, function(path, cb) {
            html2js.processFile(path, function(err, file) {
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
            params = {
                prod: false
            };
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