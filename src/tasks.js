var async = require('async');

var logger = require(__dirname+'/logger/logger'),
    server = require(__dirname+'/server/server'),
    build = require(__dirname+'/build/build');


module.exports = {
    loadEnvironment: function(params) {

        logger.clear();
        logger.info('Starting '+params.env+' environnement...', {level: 1});

        async.series([
            function(cb) {
                build.build(params, cb)
            },
            server.supervisor[params.env]
        ]);
    }
}