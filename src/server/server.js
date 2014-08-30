var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/api/api'),
    socket = require(__dirname+'/socket/socket'),
    logger = require(__dirname+'/../logger/logger'),
    db = require(__dirname+'/../db/db'),
    config = require(__dirname+'/../config/config');


var express = require('express'),
    forever = require('forever-monitor'),
    vhost = require('vhost'),
    fs = require('fs');

var sticky = require(__dirname+'/lib/sticky-session');

var frontendApps = config.frontend.list();



module.exports = {
    startDev: function(debug) {
        frontendApps.forEach(function(name) {

            var app = config.frontend.get(name);
            statics({
                port: app.development,
                name: name,
                debug: debug
            });
        });

        api({ port: config.backend.get('api').development, debug: debug });
        socket({ port: config.backend.get('socket').development, debug: debug });
        logger.log('Forever started.');
        logger.log('Webapp is online (development).');
        fs.writeFile('dist/build/livereload.log', Math.random()+"");
    },
    startProd: function(debug) {
        sticky(function() {
            var server = express();


            frontendApps.forEach(function(name) {

                var app = statics({
                    name: name,
                    debug: debug
                });
                server.use(vhost(config.frontend.get(name).production, app))
            });


            var apiApp = api({ debug: debug }),
                socketApp = socket({ debug: debug }),
                getConf = config.backend.get;

            return server
                .use(vhost(getConf('socket').production, socketApp))
                .use(vhost(getConf('api').production, apiApp))
                .listen(3000);

        }).listen(8000, function() {
            if(process.env.NODE_WORKER_ID=='MASTER') {
                logger.log('Master started on 8000 port');
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
                logger.log('Forever starting...');
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