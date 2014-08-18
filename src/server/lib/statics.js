

var fs = require('co-fs'),
    koa = require('koa'),
    serve = require('koa-static');

var logger = require(__dirname+'/../../logger/logger'),
    configApps = require(__dirname+'/../../config/config');

module.exports = function(config) {
    var app = koa(),
        cacheIndex = null,
        path = 'dist/'+configApps.getDestDir()+'/'+config.name;


    //SERVE STATIC FILES
    app.use(serve(path));

    if(config.debug) {
        //LOGGER FOR EVERY STATIC REQUEST
        app.use(function *loggerMiddleware(next){
            var start = new Date;
            yield next;
            var ms = new Date - start;
            logger.info(config.name+' : '+this.method+' '+this.url+' - '+ms+'ms', {level:3});
        });
    }

    app.use(function *htmlMiddleware(next){
        this.type = 'html';
        if(!cacheIndex || process.env.NODE_ENV=='development') {
            cacheIndex = yield fs.readFile(path+'/main.html');
        }
        this.body = cacheIndex;
    });

    app.on('error', function errorMiddleware(err){
        logger.error(config.name+':'+config.port, err);
    });
    logger.info(config.name+' listening on port '+config.port+'.', {level: 3});
    app.listen(config.port);
};