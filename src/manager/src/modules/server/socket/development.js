var async = require('async'),
gulp = require('bluestorm').gulp,
childProcess = require('child_process'),
config = require(__dirname+'/../../config/lib/config');

var child,
apps;

module.exports = function(socket) {
    socket.on('server:development:start', function(req, callback) {
        if (typeof callback == 'function') {
            process.env.NODE_ENV = 'development';

            if(child) {
                child.kill('SIGHUP');
            }
            child = childProcess.fork(__dirname+'/../lib/development', {
                cwd: req.data.path
            });
            child.on('message', function(message){
                if(message.type=='app_started') {
                    console.log(message);
                    apps.forEach(function (app) {
                        if(app.name==message.name) {
                            app.status = 'up';
                            app.port = message.port;
                        };
                    });
                }
                socket.emit('message_server', message);
            });
            child.send({
                debug: true,
                apps: req.data.apps
            });

            callback();
        }
    });

    socket.on('server:getApps', function(req, callback) {
        if (typeof callback == 'function') {
            if(apps) {
                callback(null, apps);
            } else {

                apps = [{
                    name: 'api',
                    status: 'down'
                }, {
                    name: 'socket',
                    status: 'down'
                }];
                config(req.data.path).frontend.list().forEach(function (app) {
                    apps.push({
                        name: app,
                        status: 'down'
                    })
                });
                callback(null, apps);
            }
        }
    });
    socket.on('server:isProcessing', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                callback(null, true)
            } else {
                callback(null, false)
            }
        }
    });
    socket.on('server:kill', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                child.kill('SIGHUP');
                child = null;
            } else {
                return callback('no_child');
            }

            callback();
        }
    });
};