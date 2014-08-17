var frontend = require(__dirname+'/frontend/frontend'),
    i18n = require(__dirname+'/i18n/i18n'),
    logger = require(__dirname+'/../logger/logger');

var async = require('async');

module.exports = {
    build: function(params, cb) {
        logger.info('Building files for '+params.env+' environnement...', {level: 2});
        var start = new Date;

        async.parallel([
            function(cb) {
                frontend.build(params, cb);
            },
            function(cb) {
                i18n.build(params, cb);
            }
        ], function() {
            var sec = (new Date - start)/1000;
            logger.info('Building files done ('+sec+' seconds).', {level: 2});
            cb();
        })
    }
};

var tasks = module.exports;