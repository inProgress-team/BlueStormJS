module.exports = {
    tasksLength: null,
    doneLength: null,
    first: true,
    checkFirst: function(cb) {
        if(this.first) {
            this.first = false;
            cb();
        }
    },
    gulp: function(gulp, debug) {

        var timer;
        gulp.on('start', function (e) {
            timer = new Date;
            var tasks = e.message.split(': ')[1].split(',');

            gulpLogger.tasksLength = tasks.length;
            gulpLogger.doneLength = 0;

            process.send({
                type:"progress",
                progress: 0
            });
        });
        gulp.on('stop', function (e) {
            var seconds = (new Date - timer)/1000;

            process.send({
                type:"done",
                seconds: seconds
            });
        });

        gulp.on('task_stop', function (e) {
            gulpLogger.doneLength++;
            process.send({
                type: "progress",
                progress: (gulpLogger.doneLength/gulpLogger.tasksLength)*100
            });
        });


        var err = function (e) {
            process.send({
                type: "error",
                err: e
            });
        };
        gulp.on('err', err);
        gulp.on('task_err', err);
        gulp.on('task_recursion', err);
    }
};
var gulpLogger = module.exports;
