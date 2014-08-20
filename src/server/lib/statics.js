

var fs = require('fs'),
    express = require('express'),
    serveStatic = require('serve-static');


var logger = require(__dirname+'/../../logger/logger'),
    configApps = require(__dirname+'/../../config/config');

module.exports = function(config) {
    var app = express(),
        path = 'dist/'+configApps.getDestDir()+'/'+config.name,
        serve = serveStatic(path, {'index': ['index.html', 'main.html']}),
        start;

    if(config.debug) {
        //LOGGER FOR EVERY STATIC REQUEST
        app.use(function loggerMiddleware(req, res, next){
            start = new Date;
            next();
        });
    }

    app.use(function htmlMiddleware(req, res, next){
        serve(req, res, next);
    });

    if(config.debug) {
        app.use(function(req, res, next) {
            var ms = new Date - start;
            next();
            logger.info(config.name + ' : ' + req.method + ' ' + req.url + ' - ' + ms + 'ms', {level: 3});
        });
    }

    app.on('error', function errorMiddleware(err){
        logger.error(config.name+':'+config.port, err);
    });
    logger.info(config.name+' listening on port '+config.port+'.', {level: 3});
    app.listen(config.port);
};