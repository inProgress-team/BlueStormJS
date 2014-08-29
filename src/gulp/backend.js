//


var gulp = require('gulp'),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    cache = require('gulp-cached'),
    watch = require('gulp-watch');

var server = require(__dirname+'/../server/server');

module.exports = function() {

    var jsFiles = ['src/modules/**/sockets/**/*.js','src/modules/**/api/**/*.js'];

    var tasks = {
        lint: function() {
            return gulp.src(jsFiles)
                .pipe(cache('linting'))
                .pipe(jshint())
                .pipe(jshint.reporter(stylish));
        },
        serverRestart: function() {
            server.monitor.restart();
        }
    };



    gulp.task('lint@backend', tasks.lint);
    gulp.task('server-restart@backend', tasks.serverRestart);

    gulp.task('build@backend', ['lint@backend'], function() {
        gulp.watch(jsFiles, ['lint@backend', 'server-restart@backend']);
    });
};