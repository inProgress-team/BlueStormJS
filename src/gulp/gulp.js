var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    del = require('del');

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server'),
    logger = require(__dirname+'/../logger/logger'),
    frontendBuild = require(__dirname+'/frontend/build'),
    frontendCompile = require(__dirname+'/frontend/compile'),
    backend = require(__dirname+'/backend'),
    beautifier = require(__dirname+'/beautifier');


var config = require(__dirname+'/../config'),
    block = require(__dirname+'/block');


var frontendApps = config.frontend.list(),
    builds = ['build@backend'],
    compiles = [];

frontendApps.forEach(function(app) {
    builds.push('build@'+app);
    compiles.push('compile@'+app);
});





module.exports= {
    loadTasks: function(debug) {
        gulpLogger.gulp(gulp, debug);
        frontendApps.forEach(function(app) {
            frontendBuild(app);
            frontendCompile(app);
        });
        backend();

        var timeoutRename;

        gulp.task('watch', builds, function() {
            var options = {};
            if(!debug) options.silent = true;
            livereload.listen(options);
            gulp.watch('dist/build/**/*', function(file) {
                if(!block.isBlocked) {
                    livereload.changed(file.path);
                }
            });
        });
    },
    development: function() {
        logger.log('Starting ', 'development', ['yellow'], ' mode.');
        this.loadTasks();

        var first = true;
        gulp.start('watch', function() {
            if(first) {
                server.supervisor.development();
            }
            first = false;
        });
    },
    production: function() {
        logger.log('Building ', 'development', ['yellow'], ' files.');
        this.loadTasks();

        gulp.start(builds, function() {
            logger.log('Building ', 'production', ['yellow'], ' files.');
            gulp.start(compiles, function() {
                del(['dist/build'], function () {
                    logger.log('Building production done. Execute ', 'node cli.js server-prod', ['yellow'], ' to try it.');
                });
            });
        });
    },
    beautify: function() {
        beautifier();
        gulp.start('beautifier', function () {
            console.log('Done beautifying');
        });
    }
};
