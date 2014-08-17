var fs = require('fs'),
    util = require('util'),
    async = require('async');

var minifier = require(__dirname+'/../../html/minifier');

var TEMPLATE = '   $templateCache.put(\'%s\',\n    \'%s\');\n';
module.exports = {
    escapeContent: function(content) {
        return content.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n\' +\n    \'');
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
            var res = util.format(TEMPLATE, path, process.escapeContent(content));
            cb(null, res);
        });
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
    }
};
var process = module.exports;