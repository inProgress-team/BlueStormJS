var http = require(__dirname+'/src/server/http'),
    rest = require(__dirname+'/src/server/rest'),
    socket = require(__dirname+'/src/server/socket');

var $this = module.exports;

module.exports = {
    start: function () {
        http({
            port: 8080,
            name: 'desktop'
        });
        rest({
            port: 3000
        });
        socket({
            port: 8888
        });
    }
}


