

var build = require(__dirname+'/../../../build/build');

var child,
    type;
module.exports = function(socket) {


    socket.on('tasks:development:build', function(data, callback) {
        if (typeof callback == 'function') {
            build.development(data, callback, function(message) {
                socket.emit('message_tasks', message);
            });
        }
    });
    socket.on('tasks:production:build', function(data, callback) {
        if (typeof callback == 'function') {
            build.production(data, callback, function(message) {
                socket.emit('message_tasks', message);
            });
        }
    });
    socket.on('tasks:kill', function(req, callback) {
        if (typeof callback == 'function') {
            build.kill(callback);
        }
    });
    socket.on('tasks:isProcessing', function(req, callback) {
        if (typeof callback == 'function') {
            build.isProcessing(callback)
        }
    });
};