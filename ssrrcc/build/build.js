var childProcess = require('child_process');

module.exports = {
    type: null,
    process: null,
    development: function(data, progress, done) {
        var first = true;

        if(done === undefined) {
            done = progress;
            progress = null;
        }

        process.env.NODE_ENV = 'development';

        if(this.process) {
            this.process.kill('SIGHUP');
        }
        this.type = 'development';

        this.process = childProcess.fork(__dirname+'/process/development', {
            cwd: data.path
        });
        this.process.on('message', function(message){
            if(message.type == 'progress') {
                if(typeof progress == 'function' && first) {
                    progress(message.progress);
                }
            } else if(message.type == 'done' && first) {
                if(typeof done=='function') {
                    done();
                    first = false;
                }
            }
        });

        this.process.send({
            debug: data.debug|true
        });

        done();
    },
    production: function(data, cb, msgCb) {

        process.env.NODE_ENV = 'production';
        if(this.process) {
            this.process.kill('SIGHUP');
        }
        this.type = 'production';
        this.process = childProcess.fork(__dirname+'/process/production', {
            cwd: data.path
        });
        this.process.on('message', function(message){
            if(message.type=="production_built")  {
                this.process.kill('SIGHUP');
                this.process = null;
            }
            if(typeof msgCb == 'function')
                msgCb(message);
        });
        this.process.send({
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