var childProcess = require('child_process');

var child;

module.exports = {
    start: function (type, cb) {
        if(child) {
            child.kill('SIGHUP');
            child = null;
        }
        child = childProcess.fork(__dirname+'/execute-tasks');
        child.on('message', function(message){
            if(message.state=='ended') {


                if(message.prod) {
                    child.kill();
                }
                if(typeof cb=='function') {
                    cb();
                }
            }
        });
        child.send({ type: type });
    }
}