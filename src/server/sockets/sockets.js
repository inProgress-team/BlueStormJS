var socket = require('socket.io'),
    domain = require('domain'),
    express = require('express'),
    http = require('http');
var redis = require('socket.io-redis');
var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

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
            if (!cacheFiles) {
                arborescence.getRequiredFiles('sockets', function (files) {
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
            logger.log('Sockets listening on port '+config.port+'.');
        }

        io.listen(config.port, function() {
            if(typeof callback=='function') cb();
        });
    } else {
        return server;
    }
};