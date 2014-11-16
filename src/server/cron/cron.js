var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

module.exports = function(config) {
    /**
     * Load CRON
     */
    var d = domain.create();

    d.on('error', function(err) {
        logger.error(err, 'Cron'+':'+config.port);
    });

    d.run(function() {
        arborescence.getRequiredFiles('cron', function (files) {
            arborescence.loadFiles(files, null, function () {
                if (config && config.debug) {
                    logger.log('CRON', ['green'], ' loaded.');
                }
            });
        });
    });
};