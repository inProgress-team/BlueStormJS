var server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend/frontend'),
    logger = require(__dirname+'/../logger/logger');

var async = require('async');

module.exports = {
    development: function() {
        logger.clear();
        logger.info('Starting development environnement...', {level: 1});
        logger.info('Building files for developement environnement...', {level: 2});

        async.series([
            tasks.buildDev,
            server.devStart

        ]);

    },
    production: function() {
        logger.clear();
        logger.info('Starting production environnement...', {level: 1});
        logger.info('Building files for production environnement...', {level: 2});

        async.series([
            tasks.buildProd,
            server.prodStart
        ]);

    },
    buildDev: function(cb) {
        async.parallel([
            frontend.buildDev
        ], function() {
            logger.info('Building files done.', {level: 2});
            cb();
        })
    },
    buildProd: function(cb) {
        async.parallel([
            frontend.buildProd
        ], function() {
            logger.info('Building files done.', {level: 2});
            cb();
        })
    }
};

var tasks = module.exports;