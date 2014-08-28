var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    filter = require('gulp-filter'),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    changed = require('gulp-changed'),
    cache = require('gulp-cached'),
    livereload = require('gulp-livereload'),
    rename = require("gulp-rename"),
    useref = require('gulp-useref'),
    inject = require("gulp-inject"),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    html2js = require('gulp-html2js')

var dir = 'dist/build';

var gulpLogger = require(__dirname+'/logger'),
    server = require(__dirname+'/../server/server');

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});


gulp.task('bower-files', ['clean'], function(){
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(gulp.dest('dist/build/desktop/public/js/bower_components'))
});

gulp.task('js-files', ['clean'], function(){
    return gulp.src(['app/desktop/**/*.js', 'app/common/**/*.js', 'src/**/desktop/**/*.js'])
        .pipe(gulp.dest('dist/build/desktop/public/js'));
});

gulp.task('i18n', ['clean'], function(){
    return gulp.src(['app/i18n/*.json'])
        .pipe(gulp.dest('dist/build/desktop/public/i18n'));
});

gulp.task('less', ['clean'], function(){
    gulp.src('./app/desktop/less/main.less')
        .pipe(less())
        .pipe(gulp.dest('./dist/build/desktop/public/css'));
});

gulp.task('html2js', ['clean'], function() {
    gulp.src(['./src/**/*.tpl.html', './app/common/**/*.tpl.html', './app/desktop/**/*.tpl.html'])
        .pipe(html2js({
            outputModuleName: 'templates'
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./dist/build/desktop/public/js'))
})

gulp.task('index.html', ['js-files', 'bower-files', 'i18n', 'less', 'html2js'], function(){
    var sources = gulp.src([
        'dist/build/**/bower_components/**/*.js',
        'dist/build/**/*.js',
        'dist/build/desktop/public/css/main.css'
    ], {read: false});


    return gulp.src(['app/desktop/index.html'])
        .pipe(inject(sources, {
            ignorePath: 'dist/build/desktop'
        }))
        .pipe(rename(function (path) {
            path.basename = "main";
        }))
        .pipe(gulp.dest('dist/build/desktop'));
});



module.exports= {
    development: function(debug) {
        gulpLogger.gulp(gulp);
        gulp.start([
            'watch',
            'lint'
        ], function() {
            console.log('');
            var d = debug || false;
            server.supervisor.development(d);
        });
    }
};


gulp.task('watch', ['index.html'], function() {
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
//gulp-useref     -> Process assets (js+css) in html