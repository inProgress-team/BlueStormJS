var async = require('async');

var html2js = require(__dirname+'/html2js/html2js'),
    copy = require(__dirname+'/js/copy');

module.exports = {
    build: function(params, cb) {
        async.parallel([
            function(cb) {
                html2js.build(params, cb);
            },
            function(cb) {
                copy.build(params, cb);
            }
        ], cb);
    }
}