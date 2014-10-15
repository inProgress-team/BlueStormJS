var async = require('async'),
    events = require('events'),
    eventEmitter = new events.EventEmitter();
    eventEmitter.setMaxListeners(100);

var logger = require(__dirname+'/src/logger/logger'),
    server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli'),
    arborescence = require(__dirname+'/src/arborescence');

var firstCall = true,
    modelsLoaded = false;

module.exports = {
    cli: cli,
    server: server,
    logger: logger,
    db: function(callback) {
        if (firstCall) {
            firstCall = false;
            require(__dirname + '/db')(function(err, res) {
                if (err)
                    return callback(err);

                if (res.type == 'mongoose') {
                    arborescence.getRequiredFiles('models', function (files) {
                        arborescence.loadFiles(files, null, function () {
                            eventEmitter.emit('bluestorm:modelsLoaded');
                            return callback(res.db);
                        });
                    });
                }
            });
        }
        else {
            if (modelsLoaded) {
                require(__dirname + '/db')(function(err, res) {
                    if (err)
                        return callback(err);

                    return callback(res.db);
                });
            }
            else {
                eventEmitter.on('bluestorm:modelsLoaded', function() {
                    modelsLoaded = true;
                    require(__dirname + '/db')(function(err, res) {
                        if (err)
                            return callback(err);

                        return callback(res.db);
                    });
                });
            }
        }

    },
    mongo: function(callback) {
        require(__dirname + '/mongo')(callback);
    },
    user: require(__dirname + '/src/server/user/models/user'),
    mailer: require(__dirname + '/src/email/mailer')
};