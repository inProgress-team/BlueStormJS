var argv = require('yargs')
    .usage('Bluestorm command tool.\n\nUsage: $0 [command]')
    .example('$0 start', 'Load development environment.')
    .example('$0 start-dev', 'Show help for development environment.')
    .example('$0 start-prod', 'Load debug mode for development environment.')
    .example('$0 start-local-prod', 'Load production environnement.')
    /*
    .alias('d', 'debug')
    .describe('d', 'Set output logging.')
    */
    .check(function(command) {
        command = command._[0];
        if(command===undefined) {
            command = ''
        }
        if(commands.indexOf(command)==-1) throw new Error('Command '+command+' not available !');
    });

var commands = ['','dev', 'compile'];


var server = require(__dirname+'/ssrrcc/manager/server'),
    tasks = require(__dirname+'/ssrrcc/manager/tasks/tasks');


var command = argv.argv._[0] || '';
    //debug = commands.debug || false;
switch(command) {
    case '':
        server.start('bin');
        break;
    case 'dev':
        server.start('build');
        console.log('Please start grunt watch')
        break;
    case 'compile':
        tasks.start('compile');
        break;
}
/*
module.exports = {
    command: function(commands) {
        var command = commands._[0],
            debug = commands.debug || false;

        if(command=="dev") {
            process.env.NODE_ENV = 'development';
            gulp.development(debug);



        } else if(command=="test") {
            process.env.NODE_ENV = 'production';
            process.env.NODE_TEST = true;
            gulp.production(debug);


        } else if(command=="prod") {
            process.env.NODE_ENV = 'production';
            gulp.production(debug);


        } else if(command=="local-prod") {
            process.env.NODE_ENV = 'development';
            process.env.NODE_LOCALPROD = true;
            gulp.production(debug);



        } else if(command=="server-dev") {
            process.env.NODE_ENV = 'development';
            server.startDev(debug);

        } else if(command=="server-test") {
            process.env.NODE_ENV = 'production';
            process.env.NODE_TEST = true;
            server.startProd(debug, true);

        } else if(command=="server-prod") {
            process.env.NODE_ENV = 'production';
            server.startProd(debug);

        } else if(command=="server-local-prod") {
            process.env.NODE_ENV = 'development';
            process.env.NODE_LOCALPROD = true;
            server.startDev(debug);


        } else if(command=="beautify") {
            gulp.beautify(debug);


        } else if(command=="logs") {
            logger.getLogs();
        }
    },
    argv: function() {
        return argv.argv;
    }
};
*/