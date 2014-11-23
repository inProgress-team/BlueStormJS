
var async = require('async');

module.exports = function(socket) {
    socket.on('lint:start', function(req, callback) {
        console.log('plouf');
        if (typeof callback == 'function') {
            callback(process.cwd());
        }
    });
};