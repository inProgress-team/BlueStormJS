var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/lib/api'),
    sockets = require(__dirname+'/lib/sockets'),
    logger = require(__dirname+'/../logger/logger');

var forever = require('forever-monitor');


module.exports = {
    start: function(params) {
        var env = null;
        if(params.env=='dev') {//prod-dev
            env = 'development';
            statics({ port: 8080, name: 'desktop', debug: params.debug });
            api({ port: 3000, debug: params.debug });
            sockets({ port: 8888, debug: params.debug });
        } else {
            env = 'production';
            statics({ port: 8080, name: 'desktop', debug: params.debug });
            api({ port: 3000, debug: params.debug });
            sockets({ port: 8888, debug: params.debug });
        }
        logger.info('Forever started.', {level: 2});
        logger.info('Webapp is online ('+env+').', {level: 1});
    },
    supervisor: {
        development: function(params) {
            server.supervisor.load({
                max: 3,
                command: 'node --harmony',
                env: {'NODE_ENV': 'development'},
                watch: true,
                watchDirectory: process.cwd(),
                watchIgnoreDotFiles: true,
                watchIgnorePatterns: ['node_modules/**'],
                options: ['server']
            });
        },
        production: function(params) {
            server.supervisor.load({
                max: 3,
                command: 'node --harmony',
                env: {'NODE_ENV': 'production'},
                watch: false,
                options: ['server']
            });
        },
        load: function(options) {
            var child = new (forever.Monitor)('cli.js', options);

            child.on('error', function (err) {
                logger.error('Forever', err);
            });
            child.on('start', function () {
                logger.info('Forever starting...', {level: 2});
            });
            child.on('stop', function () {
                logger.info('Forever stopped.', {level: 2});
                logger.info('Webapp is offline.', {level: 1, color: 'magenta'});
            });

            child.on('restart', function () {
                logger.info('Forever restarting...', {level: 2});
            });

            child.on('exit', function () {
                logger.error('Forever', new Error('server.js has exited after 3 restarts'));
            });

            child.start();
        }
    }
};
var server = module.exports;