var gulp = require('gulp'),
    livereload = require('gulp-livereload');

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend');



var builds = ['build@desktop', 'build@admin', 'build@splash'];


module.exports= {
    development: function(debug) {
        gulpLogger.gulp(gulp);


        frontend('desktop');
        frontend('admin');
        frontend('splash');


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
    }
};


gulp.task('watch', builds, function() {
    livereload.listen();
    gulp.watch('dist/build/**/*').on('change', livereload.changed);
});

//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
