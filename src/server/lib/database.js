var fs = require('fs'),
    domain = require('domain'),
    logger = require(__dirname+'/../../logger/logger');

module.exports = function(debug) {
    var DATA_BASE_CONFIG_FILE_PATH = process.cwd() + '/app/config/database.json',
        dataBaseConfig;

    // Check if config file for database exists
    try {
        dataBaseConfig = JSON.parse(fs.readFileSync(DATA_BASE_CONFIG_FILE_PATH));
    }
    catch (err) {
        logger.error('Database: ', new Error(process.cwd() + '/app/config/database.json doesn\'t exists or it\'s not a valid JSON.'));
        process.exit(1);
    }
    // Check if name of database is valid
    if (!dataBaseConfig || !dataBaseConfig.name || !fs.existsSync(__dirname + '/' + dataBaseConfig.name + '.js')) {
        logger.error('Database: ', new Error('name in database config file is invalid.'));
        process.exit(1);
    }

    var d = domain.create();

    d.on('error', function(err) {
        logger.error(dataBaseConfig.name, err);
    });

    d.run(function() {
        (require(__dirname + '/' + dataBaseConfig.name))(dataBaseConfig.host);
        if(debug) {
            logger.info('Successfully connected to ' + dataBaseConfig.name + ' (' + dataBaseConfig.host + ').', {level: 3});
        }
    });
};