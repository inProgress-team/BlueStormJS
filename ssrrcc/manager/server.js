var dir = __dirname+'/../../../bluestorm-manager',
    port = 8000;


var express = require('express'),
	fs = require('fs'),
    async = require('async');




module.exports = {
	start: function (type) {

        /**
         * Express
         */
		var app = express();
		app.use(express.static(dir + '/'+type));
		app.listen(port);
        console.log('Magic happens on port '+port);

        /**
         * Socket.io
         */
		var io = require('socket.io')(12003);

		io.on('connection', function (socket) {
            requireRoutes(socket);
		});
	}
};


var requireRoutes = function (socket, cb) {

    var basePath = __dirname+'/routes/',
        dirs = fs.readdirSync(basePath);
    //get all files of the good type and require them
    async.each(dirs, function (dir, cb) {

        var path = basePath+dir,
            isDir = fs.lstatSync(path).isDirectory();

        if(isDir) {
            var subdirs = fs.readdirSync(path);
            async.each(subdirs, function (dir, cb) {
                requireFile(socket, path+'/'+dir);
                cb();
            }, function() {
                cb();
            });
        } else {
            requireFile(socket, path);
            cb();
        }
    }, function() {
        if(typeof cb == 'function')
            cb();
    });
};

var requireFile = function(socket, path) {
    var r = require(path);
    if(typeof r =='function') {
        r(socket);
    }
};