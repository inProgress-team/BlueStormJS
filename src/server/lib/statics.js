

var fs = require('co-fs'),
    koa = require('koa'),
    serve = require('koa-static');

var logger = require(__dirname+'/../../logger/logger');

module.exports = function(config) {
    var app = koa(),
        cacheIndex = null;

    //SERVE STATIC FILES
    app.use(serve(process.cwd()+'/app/'+config.name+'/public'));

    if(true) {
        //LOGGER FOR EVERY STATIC REQUEST
        app.use(function *loggerMiddleware(next){
            var start = new Date;
            yield next;
            var ms = new Date - start;
            logger.info(config.name+' : '+this.method+' '+this.url+' - '+ms+'ms');
        });
    }

    app.use(function *htmlMiddleware(next){
        this.type = 'html';
        if(!cacheIndex) {
            cacheIndex = yield fs.readFile(process.cwd()+'/app/'+config.name+'/main.html');
        }
        this.body = cacheIndex;
    });

    app.on('error', function errorMiddleware(err){
        logger.error(config.name+':'+config.port, err);
    });
    logger.info(config.name+' listening on port '+config.port+'.', null, 2);
    app.listen(config.port);
};