var db = null;

module.exports = function(callback) {
    if (db)
        return callback(db);

    require(__dirname+'/src/db/db')(function(err, res) {
        if (err)
            return console.log(err);

        db = res;
        return callback(res);
    });
};