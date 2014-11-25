var async = require('async'),
gulp = require('bluestorm').gulp,
childProcess = require('child_process');


var child,
type;
module.exports = function(socket) {


    socket.on('tasks:development:build', function(req, callback) {
        if (typeof callback == 'function') {
            process.env.NODE_ENV = 'development';

            if(child) {
                child.kill('SIGHUP');
            }
            type = 'development';
            child = childProcess.fork(__dirname+'/../../../../lib/gulp/development', {
                cwd: req.data.path
            });
            child.on('message', function(message){
                socket.emit('message_tasks', message);
            });
            child.send({
                debug: true,
                apps: req.data.apps
            });

            callback();
        }
    });
    socket.on('tasks:production:build', function(req, callback) {
        if (typeof callback == 'function') {
            process.env.NODE_ENV = 'production';

            if(child) {
                child.kill('SIGHUP');
            }
            type = 'production';
            child = childProcess.fork(__dirname+'/../../../../lib/gulp/production', {
                cwd: req.data.path
            });
            child.on('message', function(message){
                if(message.type=="production_built")  {
                    child.kill('SIGHUP');
                    child = null;
                    console.log('killed');
                }
                socket.emit('message_tasks', message);
            });
            child.send({
                debug: true
            });

            callback();
        }
    });
    socket.on('tasks:kill', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                type = null;
                child.kill('SIGHUP');
                child = null;
            } else {
                return callback('no_child');
            }

            callback();
        }
    });
    socket.on('tasks:isProcessing', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                callback(null, { type: type })
            } else {
                callback(null, false)
            }
        }
    });
};