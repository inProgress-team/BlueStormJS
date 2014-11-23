//


var gulp = require('gulp');

var server = require(__dirname+'/../../../../server/server');

module.exports = function() {

    var jsFiles = ['src/modules/**/socket/**/*.js','src/modules/**/api/**/*.js','src/modules/**/models/**/*.js'];

    var tasks = {
        serverRestart: function() {
            server.monitor.restart();
        }
    };

    gulp.task('server-restart@backend', tasks.serverRestart);

    gulp.task('build@backend', function() {
        if(process.env.NODE_ENV=='development') {
            gulp.watch(jsFiles, ['server-restart@backend']);
        }
    });
};