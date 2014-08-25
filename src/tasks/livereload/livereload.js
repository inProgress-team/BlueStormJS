var fs = require('fs'),
    livereload = require('livereload');


var logger = require(__dirname+'/../../logger/logger');

module.exports = {
    server: null,

    start: function() {
        this.server = livereload.createServer({
            exts: ['log']
        });
        this.server.watch(__dirname);
    },
    reload: function() {
        logger.info('Livereload ;)', {level:3, color:'magenta'});

        fs.writeFile(__dirname + '/livereload.log', Math.random(), function(err) {
            if(err) console.log(err);
            console.log('done');
        });

    }
}