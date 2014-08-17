var server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend/frontend'),
    logger = require(__dirname+'/../logger/logger');


module.exports = {
    development: function() {
        logger.clear();
        logger.info('Starting development environnement...', ['red', 'bold', 'inverse']);
        logger.info('Building files for developement environnement...', 'yellow');
        this.buildDev(function() {
            logger.info('Building files done.', 'yellow');
            server.devStart();
        });

    },
    buildDev: function(cb) {
        frontend.buildDev(function() {
            cb();
        });
    }
};