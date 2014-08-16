var socket = require('socket.io'),
    domain = require('domain');

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
        io.on('connection', function(socket){
            socket.emit('open');
            if(!cacheFiles) {
                arborescence.getFiles('sockets', function(files) {
                    cacheFiles = files;
                    arborescence.loadFiles(cacheFiles, socket);
                });
            } else {
                arborescence.loadFiles(cacheFiles, socket);
            }

        });
        logger.info('Socket.io listening on port '+config.port);
        io.listen(config.port);
    });
};