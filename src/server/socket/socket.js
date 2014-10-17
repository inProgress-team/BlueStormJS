var socket = require('socket.io'),
    domain = require('domain'),
    express = require('express'),
    http = require('http'),
    fs = require('fs');
var redis = require('socket.io-redis');
var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    user = require(__dirname + '/../user/models/user');

var ROLES_CONFIG_FILE_PATH = process.cwd() + '/config/roles.json';
var rolesConfig;

var roleContainsRole = function(activeRole, requiredRole, callback) {
    if (!rolesConfig || rolesConfig.roles.length == 0)
        return callback(ROLES_CONFIG_FILE_PATH + ' is empty');

    for (var i=0; i<rolesConfig.roles.length; i++) {
        if (rolesConfig.roles[i].name == activeRole) {
            if (!rolesConfig.roles[i].children || rolesConfig.roles[i].children.length == 0)
                return callback('Access denied');

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

    return callback('Access denied');
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
                return callback('Access denied for this role (' + userRole + ')');

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
    var token = data.token;
    user.tokenIsValid(token, function(err, user) {
        if (err)
            return callback(err);

        data.user = user;
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
    });
};

module.exports = function(config) {
    var cacheFiles = null;


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
        io.adapter(redis({ host: 'localhost', port: 6379 }));
        io.on('connection', function (socket) {
            /**
             * Override socket.on
             */
            socket.onAux = socket.on;
            socket.on = function(url, options, userCallback) {
                if (typeof options == 'object' && (options.authentification || options.roles)) {
                    socket.onAux(url, function(data, callback) {
                        checkAuthentification(data, function(err) {
                            if (err)
                                return callback(err);

                            return userCallback(data, callback);
                        });
                    });
                }
                else {
                    socket.onAux(url, function(data, callback) {
                        if (typeof data == 'function')
                            return options(callback);
                        else
                            return options(data, callback);
                    });
                }
            };

            if (!cacheFiles) {
                arborescence.getRequiredFiles('socket', function (files) {
                    cacheFiles = files;
                    arborescence.loadFiles(cacheFiles, socket);
                });
            } else {
                arborescence.loadFiles(cacheFiles, socket);
            }

        });
    });
    if(config.port) {
        if(config.debug) {
            logger.log('Sockets', ['green'], ' listening on port ', config.port, ['yellow'], '.');
        }

        io.listen(config.port, function() {
            if(typeof callback=='function') cb();
        });
    } else {
        io.listen(8888, function() {
            if(typeof callback=='function') cb();
        });
        return server;
    }
};