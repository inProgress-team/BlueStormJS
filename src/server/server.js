var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/lib/api'),
    sockets = require(__dirname+'/lib/sockets'),
    logger = require(__dirname+'/../logger/logger');

var forever = require('forever-monitor');

module.exports = {
    start: function(params) {
        if(params.env=='development') {//prod-dev
            statics({ port: 8080, name: 'desktop', debug: params.debug });
            api({ port: 3000, debug: params.debug });
            sockets({ port: 8888, debug: params.debug });
        } else {
            statics({ port: 8080, name: 'desktop', debug: params.debug });
            api({ port: 3000, debug: params.debug });
            sockets({ port: 8888, debug: params.debug });
        }
        logger.info('Forever started.', {level: 2});
        logger.info('Webapp is online ('+params.env+').', {level: 1});
    },
    supervisor: {
        development: function(params) {
            var options = ['server-dev'];
            if(params.debug) options.push('-d');
            server.supervisor.load({
                max: 1,
                command: 'node --harmony',
                env: {'NODE_ENV': 'development'},
                watch: false,
                options: options
            });
        },
        production: function(params) {
            var options = ['server-prod'];
            if(params.debug) options.push('-d');
            server.supervisor.load({
                max: 3,
                command: 'node --harmony',
                env: {'NODE_ENV': 'production'},
                watch: false,
                options: options
            });
        },
        load: function(options) {
            server.monitor = new (forever.Monitor)('cli.js', options);

            server.monitor.on('error', function (err) {
                logger.error('Forever', err);
            });
            server.monitor.on('start', function () {
                logger.info('Forever starting...', {level: 2});
            });
            server.monitor.on('stop', function () {
                logger.info('Forever stopped.', {level: 2});
                logger.info('Webapp is offline.', {level: 1, color: 'magenta'});
            });

            server.monitor.on('restart', function () {
                logger.info('Forever restarting...', {level: 2});
            });

            server.monitor.on('exit', function () {
                logger.error('Forever', new Error('server.js has exited after '+(options.max-1)+' restarts'), {
                    stack: false
                });
            });

            server.monitor.start();
        },
        monitor: null
    }
};
var server = module.exports;