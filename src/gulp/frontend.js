var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    rename = require("gulp-rename"),
    inject = require("gulp-inject"),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    html2js = require('gulp-html2js');

module.exports = function(name) {

    var cleanTask = 'clean@'+name;

    gulp.task(cleanTask, function(cb) {
        del(['dist/build/'+name], cb);
    });


    gulp.task('bower-files@'+name, [cleanTask], function(){
        return gulp.src(mainBowerFiles(), { base: 'bower_components' })
            .pipe(gulp.dest('dist/build/'+name+'/public/js/bower_components'))
    });

    gulp.task('js-files@'+name, [cleanTask], function(){
        return gulp.src(['app/'+name+'/**/*.js', 'app/common/**/*.js', 'src/**/'+name+'/**/*.js'])
            .pipe(gulp.dest('dist/build/'+name+'/public/js'));
    });

    gulp.task('i18n@'+name, [cleanTask], function(){
        return gulp.src(['app/i18n/*.json'])
            .pipe(gulp.dest('dist/build/'+name+'/public/i18n'));
    });

    gulp.task('less@'+name, [cleanTask], function(){
        gulp.src('./app/'+name+'/less/main.less')
            .pipe(less())
            .pipe(gulp.dest('./dist/build/'+name+'/public/css'));
    });

    gulp.task('html2js@'+name, [cleanTask], function() {
        gulp.src(['./src/**/*.tpl.html', './app/common/**/*.tpl.html', './app/'+name+'/**/*.tpl.html'])
            .pipe(html2js({
                outputModuleName: 'templates'
            }))
            .pipe(concat('templates.js'))
            .pipe(gulp.dest('./dist/build/'+name+'/public/js'))
    })


    gulp.task('assets@'+name, [cleanTask], function(){
        return gulp.src('app/assets/**/*')
            .pipe(gulp.dest('dist/build/'+name+'/public/assets'))
    });

    gulp.task('index.html@'+name, ['js-files@'+name, 'bower-files@'+name, 'i18n@'+name, 'less@'+name, 'html2js@'+name], function(){
        var sources = gulp.src([
            'dist/build/'+name+'/**/bower_components/**/*.js',
            'dist/build/'+name+'/**/*.js',
            'dist/build/'+name+'/public/css/main.css'
        ], {read: false});


        return gulp.src(['app/'+name+'/index.html'])
            .pipe(inject(sources, {
                ignorePath: 'dist/build/'+name
            }))
            .pipe(rename(function (path) {
                path.basename = "main";
            }))
            .pipe(gulp.dest('dist/build/'+name));
    });

    gulp.task('build@'+name, ['index.html@'+name, 'assets@'+name]);
};