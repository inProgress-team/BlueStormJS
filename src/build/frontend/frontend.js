var less = require(__dirname+'/less/less'),
    angular = require(__dirname+'/angular/angular'),
    indexHtml = require(__dirname+'/html/index');

var async = require('async');

module.exports = {
    build: function(params, cb) {
        async.parallel([
            function(cb) {
                angular.build(params.env, cb);
            },
            function(cb) {
                less.build(params.env, cb);
            },
            function(cb) {
                indexHtml.build(params, cb);
            }
        ], cb);
    }
};