var koa = require('koa'),
    router = require('koa-router'),
    co = require('co');

var logger = require(__dirname+'/../logger/logger'),
    configWebApp = require(process.cwd()+'/app/config'),
    arborescence = require(__dirname+'/../arborescence');

module.exports = function(config) {
    var app = koa();

    /**
     * Log everything if debug param is set to true in config
     */
    if(configWebApp.debug) {
        //LOGGER FOR EVERY API REQUEST
        app.use(function *loggerMiddleware(next){
            var start = new Date;
            yield next;
            var ms = new Date - start;
            logger.info('API : '+this.method+' '+this.url+' - '+ms+'ms');
        });
    }

    /**
     * Include router and routes
     */
    app.use(router(app));
    arborescence.getFiles('api', function(files) {
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
    logger.info('API listening on port '+config.port);
    app.listen(config.port);
};