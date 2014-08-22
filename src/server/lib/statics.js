var fs = require('fs'),
    express = require('express'),
    serveStatic = require('serve-static');
//var createStatic = require('connect-static');

var logger = require(__dirname+'/../../logger/logger'),
    configApps = require(__dirname+'/../../config/config');


module.exports = function(config) {
    var app = express(),
        cacheIndex = null,
        path = 'dist/'+configApps.getDestDir()+'/'+config.name,
        //serve = serveStatic(path),
        start;

    app.use(express.static('dist/'+configApps.getDestDir()+'/'+config.name));

    if(config.debug) {
        //LOGGER FOR EVERY STATIC REQUEST
        app.use(function loggerMiddleware(req, res, next){
            start = new Date;
            next();
        });
    }

    app.all('*', function(req, res){
        if(!cacheIndex || process.env.NODE_ENV=='development') {
            cacheIndex = fs.readFileSync(path+'/main.html');
        }
        res.set('Content-Type', 'text/html');
        res.send(cacheIndex);
    });

    if(config.debug) {
        app.use(function(req, res, next) {
            var ms = new Date - start;
            next();
            logger.info(config.name + ' : ' + req.method + ' ' + req.url + ' - ' + ms + 'ms', {level: 3});
        });
    }

    if(config.port) {
        logger.info(config.name+' listening on port '+config.port+'.', {level: 3});
        app.listen(config.port, function() {
            if(typeof callback=='function') cb();
        });
    } else {
        return app
    }
};