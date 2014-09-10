var logger = require(__dirname+'/src/logger/logger'),
    server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli'),
    db = null;

module.exports = {
    cli: cli,
    server: server,
    logger: logger,
    db: function(callback) {
        if (db)
            return callback(db);

        require(__dirname+'/src/db/db')(function(err, res) {
            if (err)
                return console.log(err);

            db = res;
            return callback(res);
        });
    }
};

module.exports.userDAO = require(__dirname + '/src/server/user/dao/user');