var frontend = require(__dirname+'/frontend/frontend'),
    logger = require(__dirname+'/../logger/logger'),
    config = require(__dirname+'/../config/config');

var async = require('async');

module.exports = {
    build: function(params, cb) {
        var start = new Date;
        logger.info('Building files for '+params.env+' environnement...', {level: 2});

        async.parallel([
            function(cb) {
                frontend.build(params, cb);
            }
        ], function() {
            var sec = (new Date - start)/1000;
            logger.info('Building files done ('+sec+' seconds).', {level: 2});
            cb();
        })
    }
};

var tasks = module.exports;