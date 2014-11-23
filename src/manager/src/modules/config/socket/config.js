
var async = require('async'),
	config = require(__dirname+'/../lib/config');

module.exports = function(socket) {

    socket.on('config:get', function(req, callback) {
        if (typeof callback == 'function') {

            callback(null, {
            	frontendApps: config(req.data).frontend.list()
            });
        }
    });
};