var gulp = require('gulp'),
    livereload = require('gulp-livereload');

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server'),
    logger = require(__dirname+'/../logger/logger'),
    frontend = require(__dirname+'/frontend'),
    backend = require(__dirname+'/backend'),
    beautifier = require(__dirname+'/beautifier');



var frontendApps = ['desktop', 'admin', 'splash'],
    builds = ['build@backend'];
frontendApps.forEach(function(app) {
    builds.push('build@'+app);
});


module.exports= {
    loadTasks: function() {
        gulpLogger.gulp(gulp);
        frontendApps.forEach(function(app) {
            frontend(app);
        });
        backend();
    },
    development: function(debug) {
        logger.log('Starting ', 'development', ['yellow'], ' mode.');
        this.loadTasks();

        var first = true;
        gulp.start([
            'watch'
        ], function() {
            if(first) {
                var d = debug || false;
                server.supervisor.development(d);
            }
            first = false;
        });
    },
    production: function(debug) {
        logger.log('Building ', 'development', ['yellow'], ' files.');
        this.loadTasks();

        gulp.start(builds, function() {
            logger.log('Building ', 'production', ['yellow'], ' files.');

        });
    },
    beautify: function(debug) {
        beautifier();
        gulp.start('beautifier');

    }
};


gulp.task('watch', builds, function() {
    livereload.listen();
    gulp.watch('dist/build/**/*').on('change', livereload.changed);
});

//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
