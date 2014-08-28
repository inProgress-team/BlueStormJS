var map = require('map-stream'),
    logger = require(__dirname+'/../logger/logger');



module.exports = {
    gulp: function(gulp) {

        gulp.on('start', function (e) {
            var tasks = e.message.split(': ')[1].split(',');
            logger.log("Executing ", tasks.length, ['red'], " tasks.");
        });
        gulp.on('stop', function (e) {
            logger.log('Gulp done', ['blue', 'inverse'], ".");
        });


        gulp.on('err', function (e) {
            logger.error("GULP", e.err, {stack:false});
        });


        gulp.on('task_start', function (e) {
            //logger.log("Starting '",  e.task, ['green'], "'...");
        });
        gulp.on('task_stop', function (e) {
            logger.log("Finished '", e.task, ['green', 'underline'], "' after ", parseInt(e.duration*1000, 10), ['yellow'], " ms");
            //e.hrDuration
        });
        gulp.on('task_err', function (e) {
            console.log(e);
        });
        gulp.on('task_recursion', function (e) {
            console.log(e);
        });
    }
};

