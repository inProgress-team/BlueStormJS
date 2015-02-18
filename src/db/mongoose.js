var mongoose = require('mongoose');
var firstCall = true;

module.exports = function(host, callback) {
    if (firstCall) {
        firstCall = false;
        mongoose.connect(host, function (err) {
            if (err) {
                throw err;
            }

            return callback(null, {"type": "mongoose", "db": mongoose});
        });
    }
    else {
        mongoose.connection.on('connected', function () {
            return callback(null, {"type": "mongoose", "db": mongoose});
        });
    }
};