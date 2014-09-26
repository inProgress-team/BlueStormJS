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
    if (!rolesConfig || rolesConfig.length == 0)
        return callback(ROLES_CONFIG_FILE_PATH + ' is empty');

    for (var i=0; i<rolesConfig.length; i++) {
        if (rolesConfig[i].name == activeRole) {
            if (!rolesConfig[i].children || rolesConfig[i].children.length == 0)
                return callback('Access denied');

            for (var j=0; j<rolesConfig[i].children.length; j++) {
                if (rolesConfig[i].children[j] == requiredRole)
                    return callback();

                roleContainsRole(rolesConfig[i].children[j], requiredRole, function(err) {
                    if (!err)
                        return callback();
                });
            }
        }
    }

    return callback('user\'s role (' + activeRole + ') not found in ' + ROLES_CONFIG_FILE_PATH);
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

var checkAuthentification = function(data, options, callback) {
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    var token = data.token;
    user.tokenIsValid(token, function(err, user) {
        if (err)
            return callback(err);

        data.user = user;
        if (!options.role) {
            return callback();
        }
        else {
            if (options.role = user.role)
                return callback();

            return checkRole(user.role, options.role, callback);
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
            socket.on = function(url, options, next) {
                if (typeof options == 'object' && (options.authentification || options.role)) {
                    socket.onAux(url, function(data) {
                        checkAuthentification(data, options, function(err) {
                            if (err)
                                return socket.emit(url, {"err": err});

                            return next(data);
                        });
                    });
                }
                else {
                    console.log('C');
                    socket.onAux.apply(this, arguments);
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