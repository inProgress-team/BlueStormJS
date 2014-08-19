var fs = require('fs'),
    util = require('util'),
    async = require('async');

var minifier = require(__dirname+'/../html/minifier');

var TEMPLATE = '   $templateCache.put(\'%s\',\n    \'%s\');\n';
module.exports = {
    escapeContent: function(content) {
        return content.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n\' +\n    \'');
    },
    processFile: function(path, params, cb) {
        fs.readFile(path, function(err, content) {
            if(err) return cb(err);
            content = content.toString();
            if(params.env=='production') {//if prod, minify
                content = minifier.compress(content)
            }
            path = path.replace('src/', '').replace('app/common/', '').replace(params.appName+'/', '');
            var res = util.format(TEMPLATE, path, process.escapeContent(content));
            cb(null, res);
        });
    },
    appendTemplates: function(files, params, cb) {
        var content = "";
        async.each(files, function(path, cb) {
            process.processFile(path, params, function(err, file) {
                if(err) return cb(err)
                content+=file;
                cb();
            });
        }, function(err) {
            cb(err, content);
        });
    }
};
var process = module.exports;