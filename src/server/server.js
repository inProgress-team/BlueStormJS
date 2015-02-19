var express = require('express'),
    forever = require('forever-monitor'),
    sticky = require('socketio-sticky-session'),
    cluster = require("cluster"),
    fs = require('fs');

var statics = require(__dirname+'/statics/statics'),
    api = require(__dirname+'/api/api'),
    socket = require(__dirname+'/socket/socket'),
    logger = require(__dirname+'/../logger/logger'),
    cron = require(__dirname+'/cron/cron'),
    db = require(__dirname+'/../db/db'),
    config = require(__dirname+'/../config');

var frontendApps = config.frontend.list();

module.exports = {
    startDev: function(debug) {
        frontendApps.forEach(function(name) {
            var app = config.get('development', name);
            statics({
                port: app,
                name: name,
                debug: debug
            });
        });

        api({ port: config.get('development', 'api'), debug: debug });
        socket({ port: config.get('development', 'socket'), debug: debug });
        logger.log('Forever started.', ['blue', 'inverse']);
        logger.log('Webapp is online (', 'development', ['yellow'], ').');
        fs.exists('dist/build/livereload.log', function (exists) {
            if(exists)
                fs.writeFile('dist/build/livereload.log', Math.random()+"");
        });
    },
    startProdForApps: function(debug) {
        frontendApps.forEach(function (name) {
            var app = config.get('development', name);
            statics({
                port: app,
                name: name,
                debug: debug
            });
        });
    },
    startProdForApi: function(debug) {
        var numCPUs = require('os').cpus().length;
        var apiPort = config.get('production', 'apiPort');

        if (apiPort) {
            if (cluster.isMaster) {
                // Fork workers.
                for (var i = 0; i < numCPUs; i++) {
                    cluster.fork();
                }
                cluster.on('exit', function(worker) {
                    console.log('worker ' + worker.process.pid + ' died');
                });
            } else {
                // Workers can share any TCP connection
                // In this case its a HTTP server
                api({ port: apiPort, debug: debug });
            }
        } else {
            api({ port: config.get('development', 'api'), debug: debug });
        }
    },
    startProdForSocket: function(debug) {
        var socketPort = config.get('production', 'socketPort');
        socket({ port: socketPort, debug: debug });
    },
    startCron: function(debug) {
        cron({debug: debug});
    },
    supervisor: {
        development: function(debug) {
            var options = ['server-dev'];
            if(debug) options.push('-d');
            server.supervisor.load({
                max: 1,
                command: 'node',
                env: {'NODE_ENV': 'development'},
                watch: false,
                options: options
            });
            process.on('SIGHUP', function() {
                server.monitor.stop();
            });
        },
        load: function(options) {
            server.monitor = new (forever.Monitor)('cli.js', options);

            server.monitor.on('error', function (err) {
                logger.error(err, 'Forever');
            });
            server.monitor.on('start', function () {
                logger.log('Forever starting...', ['red']);
            });
            server.monitor.on('stop', function () {
                logger.log('Forever stopped.');
                logger.log('Webapp is offline.');
            });

            server.monitor.on('restart', function () {
                logger.log('Forever restarting...');
            });

            server.monitor.on('exit', function () {
                logger.error(new Error('server.js has exited after '+(options.max-1)+' restarts', 'Forever'), {
                    stack: false
                });
            });

            server.monitor.start();
        },
        monitor: null
    }
};
var server = module.exports;