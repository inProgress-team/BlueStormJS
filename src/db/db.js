var fs = require('fs'),
    logger = require(__dirname+'/../logger/logger'),
    db;

module.exports = function(dev, debug) {
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
    if (!dataBaseConfig || !dataBaseConfig.type || !fs.existsSync(__dirname + '/' + dataBaseConfig.type + '.js')) {
        logger.error('Database: ', new Error('name in database config file is invalid.'));
        process.exit(1);
    }
    if (dev)
        return (require(__dirname + '/' + dataBaseConfig.type))(dataBaseConfig.hostDev);
    else
        return (require(__dirname + '/' + dataBaseConfig.type))(dataBaseConfig.hostProd);
};