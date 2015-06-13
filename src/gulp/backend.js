//


var gulp = require('gulp'),
watch = require('gulp-watch');

var server = require(__dirname+'/../server/server');

module.exports = function() {

    var jsFiles = [
        'src/modules/**/socket/**/*.js',
        'src/modules/**/api/**/*.js',
        'src/modules/**/models/**/*.js',
        'src/modules/**/dao/**/*.js',
        'src/modules/**/scripts/**/*.js',
        'src/common/backend/**/*.js',
        'package.json'
    ];

    
    gulp.task('server-restart@backend', function() {
        server.monitor.restart();
    });

    var watch = function() {
        gulp.watch(jsFiles, ['server-restart@backend']);
    };

    gulp.task('build@backend', function() {
        if(process.env.NODE_ENV=='development') {
            watch();
        }
    });

    return watch;
};