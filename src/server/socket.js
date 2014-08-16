var socket = require('socket.io'),
    domain = require('domain');

var logger = require(__dirname+'/../logger/logger');

module.exports = function(config) {
    var d = domain.create();

    d.on('error', function(err) {
        logger.error('Socket.io'+':'+config.port, err);
    });

    d.run(function() {
        var io = socket();
        io.on('connection', function(socket){

        });
        logger.info('Socket.io started on port '+config.port);
        io.listen(config.port);
    });
};