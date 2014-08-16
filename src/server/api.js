var koa = require('koa'),
    router = require('koa-router');

var logger = require(__dirname+'/../logger/logger'),
    configWebApp = require(process.cwd()+'/app/config');

module.exports = function(config) {
    var app = koa();

    if(configWebApp.debug) {
        //LOGGER FOR EVERY API REQUEST
        app.use(function *loggerMiddleware(next){
            var start = new Date;
            yield next;
            var ms = new Date - start;
            logger.info('API : '+this.method+' '+this.url+' - '+ms+'ms');
        });
    }

    app.use(router(app));

    require(process.cwd()+"/src/home/api/test")(app);

    app.on('error', function(err){
        logger.error('API'+':'+config.port, err);
    });
    logger.info('API listening on port '+config.port);
    app.listen(config.port);
};