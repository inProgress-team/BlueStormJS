var koa = require('koa'),
    cors = require('koa-cors'),
    router = require('koa-router');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

module.exports = function(config) {
    var app = koa();
    app.use(cors());
    /**
     * Log everything if debug param is set to true in config
     */
    if(config.debug) {

        //LOGGER FOR EVERY API REQUEST
        app.use(function *loggerMiddleware(next){
            var start = new Date;
            yield next;
            var ms = new Date - start;
            logger.info('API : '+this.method+' '+this.url+' - '+ms+'ms', {level:3});
        });
    }

    /**
     * Include router and routes
     */
    app.use(router(app));
    arborescence.getRequiredFiles('api', function(files) {
        arborescence.loadFiles(files, app);
    });



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