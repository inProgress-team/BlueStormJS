var async = require('async'),
gulp = require('gulp'),
childProcess = require('child_process'),
config = require(__dirname+'/../../config/lib/config');

var child,
apps;

var loadDev = function (socket, data) {
    if(child) {
        socket.emit('message_server', {
            type: 'server_down'
        });
        child.kill('SIGHUP');
        child = null;
    }
    child = childProcess.fork(__dirname+'/../lib/development', {
        cwd: data.path
    });
    child.on('message', function(message){
        if(message.type=='app_started') {
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
        apps: data.apps
    });
}

module.exports = function(socket) {
    socket.on('server:development:start', function(req, callback) {
        if (typeof callback == 'function') {
            process.env.NODE_ENV = 'development';

            loadDev(socket, {
                path: req.data.path,
                apps: req.data.apps
            });


            var jsFiles = [
            req.data.path+'/src/modules/**/socket/**/*.js',
            req.data.path+'/src/modules/**/api/**/*.js',
            req.data.path+'/src/modules/**/models/**/*.js'
            ];

            gulp.task('server-restart@backend', function () {
                loadDev(socket, {
                    path: req.data.path,
                    apps: req.data.apps
                });
            });
            var w = gulp.watch(jsFiles, ['server-restart@backend']);
            process.on('SIGHUP', function(msg) {
                if(w) {
                    w.end();
                }
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
                apps.forEach(function (app) {
                    app.status = 'down';
                })
            } else {
                return callback('no_child');
            }

            callback();
        }
    });
};