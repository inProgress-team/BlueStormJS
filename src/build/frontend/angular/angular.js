var async = require('async');

var html2js = require(__dirname+'/html2js/html2js');

module.exports = {
    build: function(env, cb) {
        async.parallel([
            function(cb) {
                html2js.build(env, cb);
            }
        ], cb)
    }
}