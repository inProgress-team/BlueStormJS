var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/lib/api'),
    sockets = require(__dirname+'/lib/sockets'),
    logger = require(__dirname+'/../logger/logger');

var forever = require('forever-monitor');

var env = process.env['NODE_ENV'] || 'development';
module.exports = {
    start: function() {
        if(true) {
            statics({ port: 8080, name: 'desktop' });
            statics({ port: 2052, name: 'admin' });
            api({ port: 3000 });
            sockets({ port: 8888 });
        }
        logger.info('Forever started.', {level: 2});
        logger.info('Webapp is online ('+env+').', {level: 1});
    },
    supervisor: {
        development: function() {
            server.supervisor.load({
                max: 3,
                command: 'node --harmony',
                env: {'NODE_ENV': 'development'},
                watch: true,
                watchDirectory: process.cwd(),
                watchIgnoreDotFiles: true,
                watchIgnorePatterns: ['node_modules/**']
            });
        },
        production: function() {
            server.supervisor.load({
                max: 3,
                command: 'node --harmony',
                env: {'NODE_ENV': 'production'},
                watch: false
            });
        },
        load: function(options) {
            var child = new (forever.Monitor)('server.js', options);

            child.on('error', function (err) {
                logger.error('Forever', err);
            });
            child.on('start', function () {
                logger.info('Forever starting...', {level: 2});
            });
            child.on('stop', function () {
                logger.info('Forever stopped.', {level: 2});
            });

            child.on('restart', function () {
                logger.info('Forever restarting...', {level: 2});
            });

            child.on('exit', function () {
                logger.error('Forever', new Error('server.js has exited after 3 restarts'));
            });

            child.start();
        }
    },
};
var server = module.exports;