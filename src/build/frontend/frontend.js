var less = require(__dirname+'/less/less'),
    i18n = require(__dirname+'/i18n/i18n'),
    angular = require(__dirname+'/angular/angular'),
    indexHtml = require(__dirname+'/html/index');

var async = require('async');

module.exports = {
    build: function(params, cb) {
        async.parallel([
            function(cb) {
                angular.build(params, cb);
            },
            function(cb) {
                less.build(params.env, cb);
            },
            function(cb) {
                i18n.build(params, cb);
            }
        ], function() {
            indexHtml.build(params, cb);
        });
    }
};