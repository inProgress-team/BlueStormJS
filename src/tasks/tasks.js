var server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend/frontend');


module.exports = {
    development: function() {
        this.buildDev(function() {
            console.log('done');
            //server.devStart();
        });

    },
    buildDev: function(cb) {
        frontend.buildDev(function() {
            cb();
        });
    }
};