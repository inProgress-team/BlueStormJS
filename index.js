var statics = require(__dirname+'/src/server/statics'),
    api = require(__dirname+'/src/server/api'),
    sockets = require(__dirname+'/src/server/sockets');

var $this = module.exports;

module.exports = {
    start: function (config) {
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


