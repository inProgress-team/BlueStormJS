var statics = require(__dirname+'/lib/statics'),
    api = require(__dirname+'/lib/api'),
    sockets = require(__dirname+'/lib/sockets');

module.exports = {
    start: function() {
        statics({
            port: 8080,
            name: 'desktop'
        });
        statics({
            port: 2052,
            name: 'admin'
        });
        api({
            port: 3000
        });
        sockets({
            port: 8888
        });
        console.log('-------------------- Enjoy your server ;) --------------------');
    }
}