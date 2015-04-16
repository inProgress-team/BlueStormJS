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
    'server-dev',
    'server-prod-apps', 'server-prod-api', 'server-prod-socket',
    'server-preprod-apps', 'server-preprod-api', 'server-preprod-socket',
    'start-cron'];

var server = require(__dirname+'/server/server'),
    logger = require(__dirname+'/logger/logger'),
    gulp = require(__dirname+'/gulp/gulp');


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




        } else if(command=="server-prod-apps") {
            process.env.NODE_ENV = 'production';
            server.startProdForApps();

        } else if(command=="server-prod-api") {
            process.env.NODE_ENV = 'production';
            server.startProdForApi();

        } else if(command=="server-prod-socket") {
            process.env.NODE_ENV = 'production';
            server.startProdForSocket();


        } else if(command=="server-preprod-apps") {
            process.env.NODE_ENV = 'preproduction';
            server.startProdForApps();

        } else if(command=="server-preprod-api") {
            process.env.NODE_ENV = 'preproduction';
            server.startProdForApi();

        } else if(command=="server-preprod-socket") {
            process.env.NODE_ENV = 'preproduction';
            server.startProdForSocket();




        } else if(command=="start-cron") {
            server.startCron();

        } else {
            console.log('Command not defined');
        }





        /*
        } else if(command=="server-prod") {
            process.env.NODE_ENV = 'production';
            server.startProd(debug);
        */
        /*
        } else if(command=="server-local-prod") {
            process.env.NODE_ENV = 'development';
            process.env.NODE_LOCALPROD = true;
            server.startDev(debug);
        */   

        /*
        } else if(command=="test") {
            process.env.NODE_ENV = 'production';
            process.env.NODE_TEST = true;
            gulp.production(debug);
        */
/*
        
        } else if(command=="beautify") {
            gulp.beautify(debug);


        } else if(command=="local-prod") {
            process.env.NODE_ENV = 'development';
            process.env.NODE_LOCALPROD = true;
            gulp.production(debug);
*/
/*
        } else if(command=="server-test") {
            process.env.NODE_ENV = 'production';
            process.env.NODE_TEST = true;
            server.startProd(debug, true);
*/
        

    },
    argv: function() {
        return argv.argv;
    }
};