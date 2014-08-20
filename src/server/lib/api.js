var express = require('express'),
    async = require('async');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

module.exports = function(config) {
    var app = express(),
        start;

    //app.use(cors());
    /**
     * Log everything if debug param is set to true in config
     */
    if(config.debug) {
        //LOGGER FOR EVERY API REQUEST
        app.use(function(req, res, next){
            start = new Date;
            next();
        });
    }

    /**
     * Include router and routes
     */
        //app.use(router(app));
    arborescence.getRequiredFiles('api', function(files) {
        arborescence.loadFiles(files, app);
    });

    if(config.debug) {
        app.use(function(req, res, next){
            var ms = new Date - start;
            next();
            logger.info('API : '+req.method+' '+req.url+' - '+ms+'ms', {level:3});
        });
    }

    /**
     * Error handler
     */
    app.on('error', function(err){
        logger.error('API'+':'+config.port, err);
    });
    /**
     * Set app on port defined in conf
     */
    logger.info('API listening on port '+config.port+'.', {level: 3});
    app.listen(config.port);
};