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

var commands = ['dev', 'prod', 'server-dev', 'server-prod', 'test'];

var tasks = require(__dirname+'/tasks'),
    server = require(__dirname+'/server/server');

var tasksManager = require(__dirname+'/tasks/manager');


module.exports = {
    command: function(commands) {
        var command = commands._[0],
            debug = commands.debug || false;
        switch(command) {
            case "dev":
                var env = 'development';
                tasksManager.builder.build(env, function() {
                    tasksManager.watcher.watch();
                    server.supervisor[env]({env: env, debug: debug});
                });
                break;
            case "prod":
                var env = 'production';
                tasksManager.builder.build(env, function() {
                    server.supervisor[env]({env: env, debug: debug});
                });
                break;
            case "server-dev":
                server.start({env: 'development', debug: debug});
                break;
            case "server-prod":
                server.start({env: 'production', debug: debug});
                break;
        }
    },
    argv: function() {
        return argv.argv;
    }
};