var koa = require('koa');

var logger = require(__dirname+'/../logger/logger');

module.exports = function(config) {
    var app = koa();
    app.use(function *logger(next){
        var start = new Date;
        yield next;
        var ms = new Date - start;
        console.log('REST : %s %s - %sms', this.method, this.url, ms);
        //console.log(process.cwd());
    });


    app.on('error', function(err){
        logger.error('REST'+':'+config.port, err);
    });
    logger.info('REST started on port '+config.port);
    app.listen(config.port);
};