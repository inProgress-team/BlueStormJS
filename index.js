var staticFiles = require(__dirname+'/src/server/static'),
    api = require(__dirname+'/src/server/api'),
    socket = require(__dirname+'/src/server/socket');

var $this = module.exports;

module.exports = {
    start: function (config) {
        staticFiles({
            port: 8080,
            name: 'desktop'
        });
        staticFiles({
            port: 2052,
            name: 'admin'
        });
        api({
            port: 3000
        });
        socket({
            port: 8888
        });
        console.log('-------------------- Enjoy your server ;) --------------------');
    }
}


