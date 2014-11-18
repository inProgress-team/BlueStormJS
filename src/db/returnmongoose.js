var fs = require('fs'),
    logger = require(__dirname+'/../logger/logger'),
    mongoose = require('mongoose');

module.exports = function() {
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
    var host;

    if (env == 'development') {
        host = dataBaseConfig.hostDev;
    }
    else {
        host = dataBaseConfig.hostProd;
    }
    mongoose.connect(host, function (err) {
        if (err)
            return callback(err);

        return mongoose;
    });
};