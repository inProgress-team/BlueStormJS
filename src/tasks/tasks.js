var server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend/frontend'),
    i18n = require(__dirname+'/i18n/i18n'),
    logger = require(__dirname+'/../logger/logger');

var async = require('async');

module.exports = {
    loadEnvironment: function(params) {

        logger.clear();
        logger.info('Starting '+params.env+' environnement...', {level: 1});

        async.series([
            function(cb) {
                tasks.build(params.env, cb)
            },
            server.supervisor[params.env]
        ]);
    },
    build: function(env, cb) {
        logger.info('Building files for '+env+' environnement...', {level: 2});

        async.parallel([
            function(cb) {
                frontend.build(env, cb);
                i18n.build(env, cb);
            }
        ], function() {
            logger.info('Building files done.', {level: 2});
            cb();
        })
    }
};

var tasks = module.exports;