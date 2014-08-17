var server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend/frontend'),
    logger = require(__dirname+'/../logger/logger');

var async = require('async');

module.exports = {
    development: function() {
        logger.clear();
        logger.info('Starting development environnement...', ['red', 'bold', 'inverse']);
        logger.info('Building files for developement environnement...', 'yellow', 1);

        async.series([
            tasks.buildDev,
            server.devStart

        ]);

    },
    production: function() {
        logger.clear();
        logger.info('Starting production environnement...', ['red', 'bold', 'inverse']);
        logger.info('Building files for production environnement...', 'yellow', 1);

        async.series([
            tasks.buildProd,
            server.prodStart
        ]);

    },
    buildDev: function(cb) {
        async.parallel([
            frontend.buildDev
        ], function() {
            logger.info('Building files done.', 'yellow', 1);
            cb();
        })
    },
    buildProd: function(cb) {
        async.parallel([
            frontend.buildProd
        ], function() {
            logger.info('Building files done.', 'yellow', 1);
            cb();
        })
    }
};

var tasks = module.exports;