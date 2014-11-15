var statics = require(__dirname+'/statics/statics'),
    api = require(__dirname+'/api/api'),
    socket = require(__dirname+'/socket/socket'),
    logger = require(__dirname+'/../logger/logger'),
    cron = require(__dirname+'/cron/cron'),
    db = require(__dirname+'/../db/db'),
    config = require(__dirname+'/../config');


var express = require('express'),
    forever = require('forever-monitor'),
    vhost = require('vhost'),
    fs = require('fs');

var sticky = require(__dirname+'/sticky-session');

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
        fs.writeFile('dist/build/livereload.log', Math.random()+"");
    },
    startProd: function(debug, test) {
        var type = 'production';
        if(test!==undefined) {
            type = 'test';
        }

        sticky(function() {
            var server = express();


            frontendApps.forEach(function(name) {

                var app = statics({
                    name: name,
                    debug: debug
                });
                var urls = config.get(type, name);
                if(typeof urls == 'object') {
                    urls.forEach(function (url) {
                        server.use(vhost(url, app));
                    });
                } else {
                    server.use(vhost(urls, app));
                }
            });


            var apiApp = api({ debug: debug }),
                socketApp = socket({ debug: debug });

            server.use(vhost(config.get(type, 'socket'), socketApp))
                .use(vhost(config.get(type, 'api'), apiApp));

            if(process.env.NODE_WORKER_ID=='MASTER') {
                cron({debug: debug});
            }

            return server.listen(3333);

        }).listen(config.get(type, 'main'), function() {
            if(process.env.NODE_WORKER_ID=='MASTER') {
                logger.log('Master started on ', config.get(type, 'main'), ['red'], ' port');
            } else {
                logger.log('Worker ' + process.env.NODE_WORKER_ID+ ' started');
            }

        });
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