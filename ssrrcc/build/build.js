var childProcess = require('child_process');

module.exports = {
    type: null,
    process: null,
    development: function(data, cb, msgCb) {

        process.env.NODE_ENV = 'development';

        if(this.child) {
            this.child.kill('SIGHUP');
        }
        this.type = 'development';
        this.child = childProcess.fork(__dirname+'/development', {
            cwd: data.path
        });
        this.child.on('message', function(message){
            if(typeof msgCb == 'function')
                msgCb(message);
        });

        this.child.send({
            debug: true,
            apps: data.apps
        });

        cb();
    },
    production: function(data, cb, msgCb) {

        process.env.NODE_ENV = 'production';
        if(this.child) {
            this.child.kill('SIGHUP');
        }
        this.type = 'production';
        this.child = childProcess.fork(__dirname+'/production', {
            cwd: data.path
        });
        this.child.on('message', function(message){
            if(message.type=="production_built")  {
                this.child.kill('SIGHUP');
                this.child = null;
            }
            if(typeof msgCb == 'function')
                msgCb(message);
        });
        this.child.send({
            debug: true
        });

        cb();
    },
    kill: function(cb) {

        if(this.child) {
            this.type = null;
            this.child.kill('SIGHUP');
            this.child = null;
        } else {
            return cb('no_child');
        }


    },
    isProcessing: function(cb) {
        if(this.child) {
            cb(null, { type: this.type })
        } else {
            cb(null, false)
        }
    }


}