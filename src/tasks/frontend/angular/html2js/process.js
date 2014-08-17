var fs = require('fs'),
    util = require('util');

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
    }
};
var process = module.exports;