var fs = require('fs'),
    logger = require(__dirname+'/../logger/logger');

module.exports = function(callback) {
    var DATA_BASE_CONFIG_FILE_PATH = process.cwd() + '/config/database.json',
        dataBaseConfig;

    // Check if config file for database exists
    try {
        dataBaseConfig = JSON.parse(fs.readFileSync(DATA_BASE_CONFIG_FILE_PATH));
    }
    catch (err) {
        logger.error(new Error(DATA_BASE_CONFIG_FILE_PATH + ' doesn\'t exists or it\'s not a valid JSON.'), 'Database');
        process.exit(1);
    }
    // Check if name of database is valid
    if (!dataBaseConfig || !dataBaseConfig.type || !fs.existsSync(__dirname + '/' + dataBaseConfig.type + '.js')) {
        logger.error(new Error('name in database config file is invalid.'), 'Database');
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
    else if (env == 'production') {
        require(__dirname + '/' + dataBaseConfig.type)(dataBaseConfig.hostProd, function (err, res) {
            if (err)
                return callback(err);

            return callback(null, res);
        });
    } else if (env == 'preproduction') {
        require(__dirname + '/' + dataBaseConfig.type)(dataBaseConfig.hostPreProd, function (err, res) {
            if (err)
                return callback(err);

            return callback(null, res);
        });
    }
};