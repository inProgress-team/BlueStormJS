var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

module.exports = function(config) {
    /**
     * Load CRON
     */
    arborescence.getRequiredFiles('cron', function (files) {
        arborescence.loadFiles(files, null, function() {
            if(config && config.debug) {
                logger.log('CRON', ['green'], ' loaded.');
            }
        });
    });
};