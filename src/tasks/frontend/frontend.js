var less = require(__dirname+'/less/less'),
    angular = require(__dirname+'/angular/angular')
    async = require('async');

module.exports = {
    build: function(env, cb) {
        async.parallel([
            function(cb) {
                angular.build(env, cb);
            },
            function(cb) {
                less.build(env, cb);
            }
        ], cb);
    }
};