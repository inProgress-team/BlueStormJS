var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/lib/api'),
    sockets = require(__dirname+'/lib/sockets'),
    logger = require(__dirname+'/../logger/logger');

var forever = require('forever-monitor');

module.exports = {
    start: function() {
        statics({
            port: 8080,
            name: 'desktop'
        });
        statics({
            port: 2052,
            name: 'admin'
        });
        api({
            port: 3000
        });
        sockets({
            port: 8888
        });
        logger.info('Enjoy your server ;)', ['blue', 'bold', 'inverse']);
    },
    devStart: function() {
        logger.clear();
        var child = new (forever.Monitor)('server.js', {
            max: 3,
            command: 'node --harmony',
            watch: true,
            watchDirectory: process.cwd(),
            watchIgnoreDotFiles: true,
            watchIgnorePatterns: ['node_modules/**']
        });

        child.on('error', function (err) {
            logger.error('Forever', err);
        });
        child.on('start', function () {
            logger.info('Forever started', 'yellow');
        });
        child.on('stop', function () {
            logger.info('Forever stopped', 'yellow');
        });

        child.on('restart', function () {
            logger.info('Forever restarted', 'yellow');
        });

        child.on('exit', function () {
            logger.error('Forever', new Error('server.js has exited after 3 restarts'));
        });

        child.start();
    }
};