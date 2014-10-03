var mongoose = require('mongoose');

module.exports = function(host, callback) {
    mongoose.connect(host, function(err) {
        if (err)
            return callback(err);

        return callback(null, mongoose);
    });
};