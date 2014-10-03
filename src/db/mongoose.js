var mongoose = require('mongoose');
var firstCall = true;

module.exports = function(host, callback) {
    if (firstCall) {
        firstCall = false;
        mongoose.connect(host, function (err) {
            if (err)
                return callback(err);

            return callback(null, mongoose);
        });
    }
    else {
        mongoose.connection.on('connected', function () {
            return callback(null, mongoose);
        });
    }
};