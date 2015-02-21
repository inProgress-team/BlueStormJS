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

var commands = ['dev', 'test', 'prod',
    'local-prod', 'server-dev', 'server-test',
    'server-prod', 'server-prod-apps', 'server-prod-api', 'server-prod-socket',
    'start-cron',
    'server-local-prod', 'beautify', 'logs'];

var server = require(__dirname+'/server/server'),
    logger = require(__dirname+'/logger/logger'),
    gulp = require(__dirname+'/gulp/gulp'),
    hipchat = require(__dirname+'/../ssrrcc/connectors/hipchat/hipchat');


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

        } else if(command=="server-prod-apps") {
            process.env.NODE_ENV = 'production';
            server.startProdForApps(debug);

        } else if(command=="server-prod-api") {
            process.env.NODE_ENV = 'production';
            server.startProdForApi(debug);

        } else if(command=="server-prod-socket") {
            process.env.NODE_ENV = 'production';
            server.startProdForSocket(debug);

        } else if(command=="server-local-prod") {
            process.env.NODE_ENV = 'development';
            process.env.NODE_LOCALPROD = true;
            server.startDev(debug);

        } else if(command=="start-cron") {
            server.startCron(debug);

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