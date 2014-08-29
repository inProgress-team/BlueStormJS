var gulp = require('gulp'),
    livereload = require('gulp-livereload');

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend'),
    backend = require(__dirname+'/backend'),
    beautifier = require(__dirname+'/beautifier');



var builds = ['build@desktop', 'build@admin', 'build@splash', 'build@backend'];


module.exports= {
    development: function(debug) {
        gulpLogger.gulp(gulp);


        frontend('desktop');
        frontend('admin');
        frontend('splash');
        backend();


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
    beautify: function(debug) {
        beautifier();
        gulp.start('beautifier');

    }
};


gulp.task('watch', builds, function() {
    livereload.listen();
    gulp.watch('dist/build/**/*').on('change', livereload.changed);
});


gulp.task('beautifier', [''], function() {
    livereload.listen();
    gulp.watch('dist/build/**/*').on('change', livereload.changed);
});

//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
