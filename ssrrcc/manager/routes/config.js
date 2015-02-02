
var config = require(__dirname+'/../../config');

module.exports = function(socket) {

    socket.on('config:get', function(req, callback) {
        if (typeof callback == 'function') {

            callback(null, {
                frontendApps: config(req).frontend.list()
            });
        }
    });
};