var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    userDAO = require(__dirname + '/../user/dao/user');

var checkAuthentification = function(req, res, options, callback) {
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }
    userDAO.tokenIsValid(req.body.token, function(err, token) {
        if (err)
            return callback(err);

        req.decodedToken = token;
        if (!options.role) {
            return callback();
        }
        else {
            return callback();
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
    app.get = function(url, options, next) {
        if (typeof options == 'object' && (options.authentification || options.role)) {
            app.getAux(url, function(req, res) {
                checkAuthentification(req, res, options.role, function(err) {
                    if (err)
                        return res.send({err: err});

                    return next(req, res);
                });
            });
        }
        else {
            app.getAux.apply(this, arguments);
        }
    };

    /**
     * Override POST
     */
    app.postAux = app.post;
    app.post = function(url, options, next) {
        if (typeof options == 'object' && (options.authentification || options.role)) {
            app.postAux(url, function(req, res) {
                checkAuthentification(req, res, options.role, function(err) {
                    if (err)
                        return res.send({err: err});

                    return next(req, res);
                });
            });
        }
        else {
            app.postAux.apply(this, arguments);
        }
    };

    /**
     * Override PUT
     */
    app.putAux = app.put;
    app.put = function(url, options, next) {
        if (typeof options == 'object' && (options.authentification || options.role)) {
            app.putAux(url, function(req, res) {
                checkAuthentification(req, res, options.role, function(err) {
                    if (err)
                        return res.send({err: err});

                    return next(req, res);
                });
            });
        }
        else {
            app.putAux.apply(this, arguments);
        }
    };

    /**
     * Override DELETE
     */
    app.deleteAux = app.delete;
    app.delete = function(url, options, next) {
        if (typeof options == 'object' && (options.authentification || options.role)) {
            app.deleteAux(url, function(req, res) {
                checkAuthentification(req, res, options.role, function(err) {
                    if (err)
                        return res.send({err: err});

                    return next(req, res);
                });
            });
        }
        else {
            app.deleteAux.apply(this, arguments);
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

    async.series([
        function(callback) {
            /**
             * Include router and routes
             */
            arborescence.getRequiredFiles('api', function (files) {
                arborescence.loadFiles(files, app, callback);
            });
        },
        function() {
            /**
             * Include user module
             */
            require(__dirname + '/../user/api/user')(app);
        }
    ]);

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