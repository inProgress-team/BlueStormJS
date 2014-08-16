var koa = require('koa'),
    router = require('koa-router');

var logger = require(__dirname+'/../logger/logger');

module.exports = function(config) {
    var app = koa();

    app.use(router(app));

    require(process.cwd()+"/src/home/api/test")(app);

    app.on('error', function(err){
        logger.error('REST'+':'+config.port, err);
    });
    logger.info('REST started on port '+config.port);
    app.listen(config.port);
};