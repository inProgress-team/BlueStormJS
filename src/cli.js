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
    .demand(1);

var commands = [
    'dev', 'prod', 'preprod',
    'sdev', 'server-dev',
    'server-prod-apps', 'server-prod-api', 'server-prod-socket',
    'server-preprod-apps', 'server-preprod-api', 'server-preprod-socket',
    'start-cron', 'start-cron-prod', 'start-cron-preprod',
    'nginxpreprod', 'nginxprod',

    'beautify'
];

var server = require(__dirname+'/server/server'),
    logger = require(__dirname+'/logger/logger'),
    gulp = require(__dirname+'/gulp/gulp'),
    backend = require(__dirname+'/gulp/backend');


module.exports = {
    command: function(commands) {
        var command = commands._[0];


        if(command=="dev") {
            process.env.NODE_ENV = 'development';
            gulp.development();


        } else if(command=="preprod") {
            process.env.NODE_ENV = 'preproduction';
            gulp.production();


        } else if(command=="prod") {
            process.env.NODE_ENV = 'production';
            gulp.production();
            


        } else if(command=="server-dev") {
            process.env.NODE_ENV = 'development';
            server.startDev();


        } else if(command=="sdev") {
            process.env.NODE_ENV = 'development';
            server.supervisor.development();

            var watch = backend();
            watch();



        } else if(command=="server-prod-apps") {
            server.startProdForApps();

        } else if(command=="server-prod-api") {
            server.startProdForApi();

        } else if(command=="server-prod-socket") {
            server.startProdForSocket();


        } else if(command=="server-preprod-apps") {
            server.startProdForApps();

        } else if(command=="server-preprod-api") {
            server.startProdForApi();

        } else if(command=="server-preprod-socket") {
            server.startProdForSocket();


        } else if(command=="start-cron-prod") {
            server.startCron();

        } else if(command=="start-cron-preprod") {
            server.startCron();

        } else if(command=="start-cron") {
            server.startCron();


        } else if(command=="nginxpreprod") {
            server.generateNginxConfig();

        } else if(command=="nginxprod") {
            server.generateNginxConfig();

        
        } else if(command=="beautify") {
            gulp.beautify();

        } else {
            console.log('Command not defined');
        }
        

    },
    argv: function() {
        return argv.argv;
    }
};