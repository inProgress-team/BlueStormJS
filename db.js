var logger = require(__dirname+'/src/logger/logger');

var db = null;

module.exports = function(callback) {
    if (db)
        return callback(null, db);

    require(__dirname+'/src/db/db')(function(err, res) {
        if (err)
            return callback(err);

        db = res;
        return callback(null, res);
    });
};