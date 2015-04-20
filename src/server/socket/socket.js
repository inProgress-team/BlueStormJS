var socket = require('socket.io'),
    domain = require('domain'),
    express = require('express'),
    http = require('http'),
    fs = require('fs'),
    cluster = require("cluster");
var redis = require('socket.io-redis');
var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence'),
    user = require(__dirname + '/../user/models/user');

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
    socket.onAux = socket.on;
    socket.on = function (url, options, userCallback) {
        socket.onAux(url, function (data, callback) {
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
            logger.log('SOCKET : ' + url);
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
        var express = require('express'),
            cluster = require('cluster'),
            net = require('net'),
            sio = require('socket.io'),
            sio_redis = require('socket.io-redis');

        var port = config.port,
            num_processes = require('os').cpus().length;

        if (cluster.isMaster) {
            // This stores our workers. We need to keep them to be able to reference
            // them based on source IP address. It's also useful for auto-restart,
            // for example.
            var workers = [];

            // Helper function for spawning worker at index 'i'.
            var spawn = function (i) {
                workers[i] = cluster.fork();

                // Optional: Restart worker on exit
                workers[i].on('exit', function (worker, code, signal) {
                    console.log('respawning worker', i);
                    spawn(i);
                });
            };

            // Spawn workers.
            for (var i = 0; i < num_processes; i++) {
                spawn(i);
            }

            // Helper function for getting a worker index based on IP address.
            // This is a hot path so it should be really fast. The way it works
            // is by converting the IP address to a number by removing the dots,
            // then compressing it to the number of slots we have.
            //
            // Compared against "real" hashing (from the sticky-session code) and
            // "real" IP number conversion, this function is on par in terms of
            // worker index distribution only much faster.
            var worker_index = function (ip, len) {
                var s = '';
                for (var i = 0, _len = ip.length; i < _len; i++) {
                    if (ip[i] !== '.') {
                        s += ip[i];
                    }
                }

                return Number(s) % len;
            };

            // Create the outside facing server listening on our port.
            var server = net.createServer(function (connection) {
                // We received a connection and need to pass it to the appropriate
                // worker. Get the worker for this connection's source IP and pass
                // it the connection.
                var worker = workers[worker_index(connection.remoteAddress, num_processes)];
                worker.send('sticky-session:connection', connection);
            }).listen(port);

                logger.log('Sockets', ['green'], ' listening on port ', config.port, ['yellow'], '.');

        } else {
            // Note we don't use a port here because the master listens on it for us.
            var app = new express();

            // Here you might use middleware, attach routes, etc.

            // Don't expose our internal server to the outside.
            var server = app.listen(0, 'localhost'),
                io = sio(server);

            io.on('connection', onConnect);

            // Tell Socket.IO to use the redis adapter. By default, the redis
            // server is assumed to be on localhost:6379. You don't have to
            // specify them explicitly unless you want to change them.
            io.adapter(sio_redis({ host: 'localhost', port: 6379 }));

            // Here you might use Socket.IO middleware for authorization etc.

            // Listen to messages sent from the master. Ignore everything else.
            process.on('message', function (message, connection) {
                if (message !== 'sticky-session:connection') {
                    return;
                }

                // Emulate a connection event on the server by emitting the
                // event with the connection the master sent us.
                server.emit('connection', connection);
            });
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
            io.adapter(redis({ host: 'localhost', port: 6379 }));
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