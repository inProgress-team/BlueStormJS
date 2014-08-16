var http = require(__dirname+'/src/server/http'),
    api = require(__dirname+'/src/server/api'),
    socket = require(__dirname+'/src/server/socket');

var $this = module.exports;

module.exports = {
    start: function () {
        http({
            port: 8080,
            name: 'desktop'
        });
        api({
            port: 3000
        });
        socket({
            port: 8888
        });
    }
}


