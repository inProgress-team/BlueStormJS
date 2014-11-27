var logger = require(__dirname+'/../../../../../../logger/logger');



module.exports = {
    gulp: function(gulp, debug) {

        var timer;
        gulp.on('start', function (e) {
            timer = new Date;
            var tasks = e.message.split(': ')[1].split(',');

            process.send({
                type:"tasks_executing",
                count: tasks.length
            });
        });
        gulp.on('stop', function (e) {
            var seconds = (new Date - timer)/1000;

            process.send({
                type:"tasks_done",
                seconds: seconds
            });

            //logger.log('Gulp done in ' , ['blue'], seconds, ['yellow'], " seconds.", ['blue']);
        });


        gulp.on('err', function (e) {
            logger.error("GULP", e.err, {stack:false});
        });


        gulp.on('task_start', function (e) {
            //logger.log("Starting '",  e.task, ['green'], "'...");
        });
        gulp.on('task_stop', function (e) {
            process.send({
                type:"task_done"
            });
            //logger.log("Finished '", e.task, ['green', 'underline'], "' after ", parseInt(e.duration * 1000, 10), ['yellow'], " ms");
        });
        gulp.on('task_err', function (e) {
            console.log(e);
        });
        gulp.on('task_recursion', function (e) {
            console.log(e);
        });
    }
};

