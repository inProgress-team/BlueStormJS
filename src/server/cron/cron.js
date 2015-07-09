var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    domain = require('domain');

module.exports = function(config) {
    /**
     * Load CRON
     */
    var d = domain.create();

    d.on('error', function(err) {
        logger.error(err, 'Cron'+':'+config.port);
    });

    d.run(function() {
        /*
        arborescence.getCrons('cron', function (files) {
            arborescence.loadCrons(files, function () {
                if (config && config.debug) {
                    logger.log('CRON', ['green'], ' loaded.');
                }
            });
        });
        */
        setTimeout(function () {
            arborescence.getRequiredFiles('cron', function (files) {
                arborescence.loadCrons(files, function () {
                    if (config && config.debug) {
                        logger.log('CRON', ['green'], ' loaded.');
                    }
                });
            });
        }, 5000);
    });
};