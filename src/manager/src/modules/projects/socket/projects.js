
var async = require('async');

module.exports = function(socket) {
    socket.on('projects:getDefaultPath', function(req, callback) {
        if (typeof callback == 'function') {
            callback(process.cwd());
        }
    });
    socket.on('projects:getProjectsDir', function(req, callback) {
        if (typeof callback == 'function') {
            callback(null, [{
                path: '/Users/mokto/Projects/songpeek',
                name: 'Songpeek'
            }]);
        }
    });
};