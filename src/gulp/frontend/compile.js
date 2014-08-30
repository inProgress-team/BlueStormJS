var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    inject = require("gulp-inject"),
    uncss = require('gulp-uncss'),
    minifyCSS = require('gulp-minify-css');

module.exports = function(name) {
    var dir = 'dist/bin/'+name,
        publicDir = 'dist/bin/'+name+'/public',
        cleanTask = 'clean#compile@'+name;

    var indexHtmlFile = 'src/apps/'+name+'/index.html';


    gulp.task(cleanTask, function(cb) { del(['dist/bin/'+name], cb); });

    gulp.task('i18n#compile@'+name, [cleanTask], function(){
        return gulp.src('dist/build/'+name+'/public/i18n/*.json')
            .pipe(gulp.dest(publicDir+'/i18n'));
    });

    gulp.task('assets#compile@'+name, [cleanTask], function(){
        return gulp.src('src/common/assets/**/*')
            .pipe(gulp.dest('dist/bin/'+name+'/public/assets'))
    });

    gulp.task('js-files#compile@'+name, [cleanTask], function(){
        return gulp.src([
                'dist/build/'+name+'/public/js/bower_components/**/*.js',
                'dist/build/'+name+'/public/js/**/*.js'
        ])
            .pipe(concat('main.min.js'))
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(gulp.dest(publicDir));
    });

    gulp.task('css-files#compile@'+name, [cleanTask], function(){
        return gulp.src('dist/build/'+name+'/public/css/main.css')
            .pipe(rename(function (path) {path.extname = ".min.css";}))
            .pipe(minifyCSS())
            .pipe(gulp.dest(publicDir));
    });





    gulp.task('index.html#compile@'+name, [
        'js-files#compile@'+name,
        'css-files#compile@'+name
    ], function(){
        var sources = gulp.src([
                publicDir+'/main.min.js',
                publicDir+'/main.min.css'
        ], {read: false});

        return gulp.src(indexHtmlFile)
            .pipe(rename(function (path) {path.basename = "main";}))
            .pipe(inject(sources, {ignorePath: dir}))
            .pipe(gulp.dest(dir));
    });




    gulp.task('compile@'+name, [
        'index.html#compile@'+name,
        'i18n#compile@'+name,
        'assets#compile@'+name
    ]);
};