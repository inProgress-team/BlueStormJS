var gulp = require('gulp'),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    cache = require('gulp-cached'),
    livereload = require('gulp-livereload');

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server'),
    frontend = require(__dirname+'/frontend');



var builds = ['build@desktop', 'build@admin'];


module.exports= {
    development: function(debug) {
        gulpLogger.gulp(gulp);


        frontend('desktop');
        frontend('admin');


        var first = true;
        gulp.start([
            'watch',
            'lint'
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
    gulp.watch(['./**/*.js', '!./bower_components/**', '!./node_modules/**', '!./dist/**'], ['lint']);
});

gulp.task('lint', function() {
    return gulp.src(['./**/*.js', '!./bower_components/**', '!./node_modules/**', '!./dist/**'])
        .pipe(cache('linting'))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
