var socket = require('socket.io'),
    domain = require('domain');
var redis = require('socket.io-redis');
var logger = require(__dirname+'/../../logger/logger'),
    arborescence = require(__dirname+'/../../arborescence');

module.exports = function(config) {
    var d = domain.create();
    var cacheFiles = null;

    d.on('error', function(err) {
        logger.error('Socket.io'+':'+config.port, err);
    });

    d.run(function() {
        var io = socket();
        io.adapter(redis({ host: 'localhost', port: 6379 }));
        io.on('connection', function(socket){
            socket.emit('open');
            if(!cacheFiles) {
                arborescence.getRequiredFiles('sockets', function(files) {
                    cacheFiles = files;
                    arborescence.loadFiles(cacheFiles, socket);
                });
            } else {
                arborescence.loadFiles(cacheFiles, socket);
            }

        });
        logger.info('Socket.io listening on port '+config.port+'.', {level: 3});
        io.listen(config.port);
    });
};