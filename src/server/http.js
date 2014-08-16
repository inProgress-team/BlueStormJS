

var fs = require('co-fs'),
    koa = require('koa'),
    serve = require('koa-static');

var logger = require(__dirname+'/../logger/logger');

module.exports = function(config) {
    var app = koa(),
        cacheIndex = null;

    app.use(serve(process.cwd()+'/app/'+config.name+'/public'));


    app.use(function *html(next){
        this.type = 'html';
        if(!cacheIndex) {
            cacheIndex = yield fs.readFile(process.cwd()+'/app/'+config.name+'/main.html');
        }
        this.body = cacheIndex;
    });

    app.on('error', function(err){
        logger.error(config.name+':'+config.port, err);
    });
    logger.info(config.name+' started on port '+config.port);
    app.listen(config.port);
};