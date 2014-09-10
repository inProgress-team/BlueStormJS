var logger = require(__dirname+'/src/logger/logger'),
    server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli');

module.exports = {
    cli: cli,
    server: server,
    logger: logger,
    db: function(callback) {
        require(__dirname + '/db')(callback);
    },
    userDAO: require(__dirname + '/src/server/user/dao/user')
};