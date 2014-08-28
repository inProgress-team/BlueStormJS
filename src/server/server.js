var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/api/api'),
    sockets = require(__dirname+'/sockets/sockets'),
    logger = require(__dirname+'/../logger/logger'),
    db = require(__dirname+'/../db/db');

var express = require('express');
var forever = require('forever-monitor');
var vhost = require('vhost');

var sticky = require(__dirname+'/lib/sticky-session');

module.exports = {
    startDev: function(debug) {
        statics({ port: 8080, name: 'desktop', debug: debug });
        api({ port: 8000, debug: debug });
        sockets({ port: 8888, debug: debug });
        logger.log('Forever started.');
        logger.log('Webapp is online (development).');
        //console.dump(db.mongo.collections('users'));
    },
    startProd: function(debug) {
        sticky(function() {
            var server = express();

            var staticsApp = statics({ name: 'desktop', debug: debug }),
                apiApp = api({ debug: debug }),
                socketsApp = sockets({ debug: debug });

            return server
                .use(vhost('socket-dev.assipe-software.fr', socketsApp))
                .use(vhost('api-dev.assipe-software.fr', apiApp))
                .use(vhost('dev.assipe-software.fr', staticsApp))
                .listen(3000);

        }).listen(8000, function() {
            if(process.env.NODE_WORKER_ID=='MASTER') {
                logger.info('Master started on 8080 port', {level:11, color:'green'});
            } else {
                logger.info('Worker ' + process.env.NODE_WORKER_ID+ ' started', {level:2});
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