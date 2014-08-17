var argv = require('yargs')
    .usage('NodeFramework command tool.\n\nUsage: $0 [command] [options]')
    .example('$0 dev', 'Load development environment.')
    .example('$0 dev --help', 'Show help for development environment.')
    .example('$0 dev -d', 'Load debug mode for development environment.')
    .example('$0 prod', 'Load production environnement.')
    .check(function(command) {
        command = command._[0];
        if(commands.indexOf(command)==-1) throw new Error('Command '+command+' not available !');
    })
    .demand(1)
    .alias('d', 'debug')
    .describe('d', 'Set output logging.')
    .alias('h', 'help')
    .describe('h', 'See help for a particular command.');

var commands = ['dev', 'prod', 'server'];

var tasks = require(__dirname+'/tasks'),
    server = require(__dirname+'/server/server');

module.exports = {
    command: function(commands) {
        var command = commands._[0],
            debug = commands.debug || false;
        switch(command) {
            case "dev":
                tasks.loadEnvironment({env: 'development', debug: debug});
                break;
            case "prod":
                tasks.loadEnvironment({env: 'production', debug: debug});
                break;
            case "server":
                server.start({env: 'development', debug: debug});
                break;
        }
    },
    argv: function() {
        return argv.argv;
    }
};