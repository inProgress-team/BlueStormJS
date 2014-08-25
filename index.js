var logger = require(__dirname+'/src/logger/logger'),
    server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli'),
    db = require(__dirname+'/src/db/db');

module.exports = {
    cli: cli,
    server: server,
    logger: logger,
    db: db
};