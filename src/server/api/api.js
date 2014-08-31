var express = require('express');
var bodyParser = require('body-parser');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

var checkAuthentification = function(req, res, options, next) {
    next(req, res);
};

module.exports = function(config, cb) {
    var app = express(),
        start;

    /**
     * Override GET
     */
    app.getAux = app.get;
    app.get = function(url, options, next) {
        if (typeof options == 'object' && options.authentification) {
            app.getAux(url, function(req, res) {
               checkAuthentification(req, res, {"role": options.role}, next);
            });
        }
        else {
            app.getAux.apply(this, arguments);
        }
    };

    app.use(bodyParser.json());

    /**
     * CORS
     */
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    });
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
    arborescence.getRequiredFiles('api', function (files) {
        arborescence.loadFiles(files, app);
    });

    if(config.debug) {
        app.use(function(req, res, next){
            var ms = new Date - start;
            next();
            logger.log('API : '+req.method+' '+req.url+' - '+ms+'ms');
        });
    }


    /**
     * Set app on port defined in conf
     */
    if(config.port) {
        if(config.debug) {
            logger.log('API', ['green'], ' listening on port ', config.port, ['yellow'], '.');
        }
        app.listen(config.port, function() {
            if(typeof callback=='function') cb();
        });
    } else {
        return app
    }
};