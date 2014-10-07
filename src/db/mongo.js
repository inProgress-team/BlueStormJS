module.exports = function(host, callback) {
    require("mongodb").MongoClient.connect(host, function(err, db) {
        if (err)
            return callback(err);

        return callback(null, {"type": "mongo", "db": db});
    });
};