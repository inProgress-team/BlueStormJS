var server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli/cli');

module.exports = {
    server: server,
    cli: cli.command,
    argv: cli.argv
};


