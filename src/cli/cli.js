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


var commands = ['dev', 'prod'];


module.exports = {
    command: function(commands) {
        switch(commands._[0]) {
            case "dev":
                console.log('dev');
                break;
            case "prod":
                console.log('prod');
                break;
        }
    },
    argv: function() {
        return argv.argv;
    }
}