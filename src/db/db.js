var fs = require('fs'),
    logger = require(__dirname+'/../logger/logger');

module.exports = function(callback) {
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

    var env = process.env.NODE_ENV || 'development';
    if (env == 'development') {
        require(__dirname + '/' + dataBaseConfig.type)(dataBaseConfig.hostDev, function (err, res) {
            if (err)
                return callback(err);

            return callback(null, res);
        });
    }
    else {
        require(__dirname + '/' + dataBaseConfig.type)(dataBaseConfig.hostProd, function (err, res) {
            if (err)
                return callback(err);

            return callback(null, res);
        });
    }
};