var socket = require('socket.io'),
    domain = require('domain'),
    express = require('express'),
    http = require('http'),
    fs = require('fs');
var redis = require('socket.io-redis');
var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    user = require(__dirname + '/../user/models/user'),
    appConfig = require(__dirname+'/../../config');

var ROLES_CONFIG_FILE_PATH = process.cwd() + '/config/roles.json';

var rolesConfig;

var cacheFiles;
var config;

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

var checkAuthentification = function(data, callback) {
    if (!data.user)
        return callback('access_denied');

    if (!data.roles) {
        return callback();
    }
    else {
        if (data.roles.indexOf(data.user.role) > -1)
            return callback();

        checkRoles(data.user.role, data.roles, function(err) {
            if (err)
                return callback(err);

            return callback();
        });
    }
};

var onConnect = function(socket) {
    /**
     * Override socket.on
     */
    if (process.env.NODE_ENV == 'development' || process.env.DEBUG)
        console.log('SOCKET CONNECTED');

    socket.on('disconnect', function() {
        if (process.env.NODE_ENV == 'development' || process.env.DEBUG)
            console.log('SOCKET DISCONNECTED');
    });

    socket.onAux = socket.on;
    socket.on = function (url, options, userCallback) {
        socket.onAux(url, function (data, callback) {
            if (process.env.NODE_ENV == 'development' || process.env.DEBUG) {
                console.log('SOCKET : '+url);
            }

            if (typeof data == 'function') {
                callback = data;
                data = {
                    data: {}
                };
            } else if (!data) {
                data = {
                    data: {}
                };
            }

            user.tokenIsValid(data.token, function (err, user) {
                if (!err && user)
                    data.user = user;

                if (!data.data)
                    data.data = {};
                if (typeof options == 'object' && (options.authentification || options.roles)) {
                    if (options.roles)
                        data.roles = options.roles;

                    checkAuthentification(data, function (err) {
                        if (err)
                            return callback(err);

                        return userCallback(data, callback);
                    });
                }
                else {
                    return options(data, callback);
                }
            });
        });
    };

    if (!cacheFiles) {
        arborescence.getRequiredFiles('socket', function (files) {
            cacheFiles = files;
            arborescence.loadFiles(cacheFiles, socket);
        });
    } else {
        arborescence.loadFiles(cacheFiles, socket);
    }
};

module.exports = function(c) {
    config = c || {};

    if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'preproduction') {
        var io;
        if(config.port) {
            io = socket();
        } else {
            var app = express();
            var server = http.createServer(app);
            io = socket(server);
        }
        var d = domain.create();

        d.on('error', function(err) {
            logger.error(err, 'Socket.io'+':'+config.port);
        });

        d.run(function() {
            io.adapter(redis({ host: appConfig.redis.getConfig().host, port: appConfig.redis.getConfig().port }));
            io.on('connection', onConnect);
        });
        if(config.port) {
            logger.log('Sockets', ['green'], ' listening on port ', config.port, ['yellow'], '.');

            io.listen(config.port);
        } else {
            io.listen(8888);
            return server;
        }
    } else {
        var io;
        if(config.port) {
            io = socket();
        } else {
            var app = express();
            var server = http.createServer(app);
            io = socket(server);
        }
        var d = domain.create();

        d.on('error', function(err) {
            logger.error(err, 'Socket.io'+':'+config.port);
        });

        d.run(function() {
            io.adapter(redis({ host: appConfig.redis.getConfig().host, port: appConfig.redis.getConfig().port }));
            io.on('connection', onConnect);
        });
        if(config.port) {
            logger.log('Sockets', ['green'], ' listening on port ', config.port, ['yellow'], '.');

            io.listen(config.port, function() {
                if(typeof callback=='function') cb();
            });
        } else {
            io.listen(8888, function() {
                if(typeof callback=='function') cb();
            });
            return server;
        }
    }
};
