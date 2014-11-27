//


var gulp = require('gulp'),
    prettify = require('gulp-jsbeautifier');

module.exports = function() {


    gulp.task('beautifier', function() {
        return gulp.src([
            'src/**/*.html',
            'src/**/*.js',
            'src/**/*.css',
            'src/**/*.json'
        ])
            .pipe(prettify({
                mode: 'VERIFY_AND_WRITE',
                html: {
                    indentChar: "\t",
                    indentSize: 1
                },
                css: {
                    indentChar: "\t",
                    indentSize: 1
                },
                js: {
                    indentWithTabs: true
                }
            }))
            .pipe(gulp.dest('src'));
    })
};