var map = require('map-stream'),
    logger = require(__dirname+'/../logger/logger');


module.exports = {
    gulp: function(gulp) {

        gulp.on('start', function (e) {
            var msg = e.message.split(': ')[1];
            logger.info("Executing "+ msg, {level:1});
        });
        gulp.on('stop', function (e) {
            logger.info('Gulp done.', {level:1});
        });


        gulp.on('err', function (e) {
            logger.error("GULP", e.err, {stack:false});
        });



        gulp.on('task_start', function (e) {
            //logger.info("Starting '"+ e.task + "'...", {level:2});
        });
        gulp.on('task_stop', function (e) {
            logger.info("Finished '"+ e.task + "' after "+ parseInt(e.duration*1000, 10) + "ms", {level:2});
            //e.hrDuration
        });
        gulp.on('task_err', function (e) {
            console.log(e);
        });
        gulp.on('task_recursion', function (e) {
            console.log(e);
        });
    },
    jshint: map(function (file, cb) {
        if (!file.jshint.success) {
            logger.info('JSHINT failed in '+file.path.substring(process.cwd().length+1), {level:3});
            file.jshint.results.forEach(function (err) {
                if (err.error) {
                    var error = err.error;
                    logger.info('line '+error.line+ ', col '+error.character+' : '+error.reason, {level:4});
                    if(error.evidence.trim().length>1) {
                        logger.info(error.evidence.trim(), {level:5});
                    }
                }
            });
        }
        cb(null, file);
    })
};

