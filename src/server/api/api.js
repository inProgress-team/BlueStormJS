var express = require('express'),
    bodyParser = require('body-parser'),
    async = require('async');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    user = require(__dirname + '/../user/models/user');

var checkAuthentification = function(req, res, next) {
    var token = req.headers['x-auth-token'] || req.body.token;
    user.tokenIsValid(token, function(err, user) {
        if (err)
            return next(err);

        req.user = user;
        if (!req.role) {
            return next();
        }
        else {
            return next();
        }
    });
};

module.exports = function(config, cb) {
    var app = express(),
        start;
    /**
     * Override GET
     */
    app.getAux = app.get;
    app.get = function(url, callbacks, callback) {
        for (var i=1; i<arguments.length; i++) {
            if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].role)) {
                var options = arguments[i];
                app.use(function(req, res, next) {
                    if (options.role)
                        req.role = options.role;
                    next();
                });
                arguments[i] = checkAuthentification;
            }
        }

        app.getAux.apply(this, arguments);
    };

    /**
     * Override POST
     */
    app.postAux = app.post;
    app.post = function(url, options, next) {
        for (var i=1; i<arguments.length; i++) {
            if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].role)) {
                var options = arguments[i];
                app.use(function(req, res, next) {
                    if (options.role)
                        req.role = options.role;
                    next();
                });
                arguments[i] = checkAuthentification;
            }
        }

        app.postAux.apply(this, arguments);
    };

    /**
     * Override PUT
     */
    app.putAux = app.put;
    app.put = function(url, options, next) {
        for (var i=1; i<arguments.length; i++) {
            if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].role)) {
                var options = arguments[i];
                app.use(function(req, res, next) {
                    if (options.role)
                        req.role = options.role;
                    next();
                });
                arguments[i] = checkAuthentification;
            }
        }

        app.putAux.apply(this, arguments);
    };

    /**
     * Override DELETE
     */
    app.deleteAux = app.delete;
    app.delete = function(url, options, next) {
        for (var i=1; i<arguments.length; i++) {
            if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].role)) {
                var options = arguments[i];
                app.use(function(req, res, next) {
                    if (options.role)
                        req.role = options.role;
                    next();
                });
                arguments[i] = checkAuthentification;
            }
        }

        app.deleteAux.apply(this, arguments);
    };

    app.use(bodyParser.json());

    /**
     * CORS
     */
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, X-AUTH-TOKEN');
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