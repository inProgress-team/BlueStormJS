var async = require('async');

var build = require(__dirname+'/../../../build/build');

var child,
    type;
module.exports = function(socket) {


    socket.on('development:start', function(data, callback) {
        
        build.development(data, function (progress) {
            console.log(progress);
        }, function(message) {
            console.log('doneaaah')
        });

    });
    socket.on('development:kill', function(data, callback) {
        build.kill(function () {
            if (typeof callback == 'function') { callback(); }
        });
    });
};