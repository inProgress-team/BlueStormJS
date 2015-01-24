var express = require('express'),
    bodyParser = require('body-parser'),
    async = require('async'),
    fs = require('fs'),
    domain = require('domain'),
    compression = require('compression'),
    _ = require('underscore');

var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    user = require(__dirname + '/../user/models/user'),
    multer  = require('multer');


var ROLES_CONFIG_FILE_PATH = process.cwd() + '/config/roles.json';
var rolesConfig;

var app = express(),
    start;

var roleContainsRole = function(activeRole, requiredRole, callback) {
    if (!rolesConfig || rolesConfig.roles.length == 0)
        return callback(ROLES_CONFIG_FILE_PATH + ' is empty');

    for (var i=0; i<rolesConfig.roles.length; i++) {
        if (rolesConfig.roles[i].name == activeRole) {
            if (!rolesConfig.roles[i].children || rolesConfig.roles[i].children.length == 0)
                return callback('access_denied');

            for (var j=0; j<rolesConfig.roles[i].children.length; j++) {
                if (rolesConfig.roles[i].children[j] == requiredRole)
                    return callback();

                roleContainsRole(rolesConfig.roles[i].children[j], requiredRole, function(err) {
                    if (!err)
                        return callback();
                });
            }
        }
    }

    return callback('access_denied');
};

var checkRole = function(userRole, requiredRole, callback) {
    if (!rolesConfig) {
        // Check if config file for roles exists
        try {
            rolesConfig = JSON.parse(fs.readFileSync(ROLES_CONFIG_FILE_PATH));
        }
        catch (err) {
            logger.error(new Error(ROLES_CONFIG_FILE_PATH + ' doesn\'t exists or it\'s not a valid JSON.'), 'Roles');
            process.exit(1);
        }
    }
    return roleContainsRole(userRole, requiredRole, callback);
};

var checkRoles = function(userRole, requiredRoles, callback) {
    if (requiredRoles.length == 1)
        return checkRole(userRole, requiredRoles[0], callback);

    var i=0;
    var done = false;

    async.doWhilst(
        function(callback) {
            if (i >= requiredRoles.length)
                return callback('access_denied');

            checkRole(userRole, requiredRoles[i], function(err) {
                if (!err)
                    done = true;

                i++;
                return callback();
            });
        },
        function() {
            return !done;
        },
        function(err) {
            if (err) {
                if (callback)
                    return callback(err);
                throw err;
            }
            if (callback)
                return callback();
        }
    );
};

var checkAuthentification = function(req, res, next) {
    if (!req.user)
        return res.send({err: 'access_denied'});

    if (!req.roles) {
        return next();
    }
    else {
        if (req.roles.indexOf(req.user.role) > -1)
            return next();

        checkRoles(req.user.role, req.roles, function(err) {
            if (err)
                return res.send({"err": err});

            return next();
        });
    }
};

var checkAuthentificationPost = function(req, res, next) {
    if (app.rolesForPost[req.url]) {
        req.roles = app.rolesForPost[req.url];
    }

    return checkAuthentification(req, res, next);
};

var checkAuthentificationGet = function(req, res, next) {
    if (app.rolesForGet[req.url]) {
        req.roles = app.rolesForGet[req.url];
    }

    return checkAuthentification(req, res, next);
};

var checkAuthentificationPut = function(req, res, next) {
    if (app.rolesForPut[req.url]) {
        req.roles = app.rolesForPut[req.url];
    }

    return checkAuthentification(req, res, next);
};

var checkAuthentificationDelete = function(req, res, next) {
    if (app.rolesForDelete[req.url]) {
        req.roles = app.rolesForDelete[req.url];
    }

    return checkAuthentification(req, res, next);
};

module.exports = function(config, cb) {
    var d = domain.create();

    d.on('error', function(err) {
        logger.error(err, 'API'+':'+config.port);
    });

    d.run(function() {
        /**
         * Vars for methods
         */
        app.rolesForPost = [];
        app.rolesForGet = [];
        app.rolesForPut = [];
        app.rolesForDelete = [];

        /**
         * Override GET
         */
        app.getAux = app.get;
        app.get = function(url, options, next) {
            for (var i=1; i<arguments.length; i++) {
                if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].roles)) {
                    if (arguments[i].roles)
                        app.rolesForGet[url] = arguments[i].roles;
                    arguments[i] = checkAuthentificationGet;
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
                if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].roles)) {
                    if (arguments[i].roles)
                        app.rolesForPost[url] = arguments[i].roles;
                    arguments[i] = checkAuthentificationPost;
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
                if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].roles)) {
                    if (arguments[i].roles)
                        app.rolesForPut[url] = arguments[i].roles;
                    arguments[i] = checkAuthentificationPut;
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
                if (typeof arguments[i] == 'object' && (arguments[i].authentification || arguments[i].roles)) {
                    if (arguments[i].roles)
                        app.rolesForDelete[url] = arguments[i].roles;
                    arguments[i] = checkAuthentificationDelete;
                }
            }

            app.deleteAux.apply(this, arguments);
        };

        if (process.env.NODE_ENV != 'development') {
            app.use(compression());
        }

        app.use(multer());
        app.use(bodyParser.json());

        app.use(function(req, res, next) {
            var token = req.headers['x-auth-token'] || req.query.token || req.body.token;

            user.tokenIsValid(token, function (err, user) {
                if (!err && user) {
                    req.user = user;
                }

                delete req.body.token;
                return next();
            });
        });

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
                var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                logger.log('API : '+req.method+' '+req.url+' - '+ip+' - '+ms+'ms');
            });
        }
    });



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