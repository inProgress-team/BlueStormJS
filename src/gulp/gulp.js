var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    filter = require('gulp-filter');
var stylish = require('jshint-stylish');
var jshint = require('gulp-jshint');

var dir = 'dist/build';

var gulpLogger = require(__dirname+'/logger');

gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['dist'], cb);
});


gulp.task('bower-files', ['clean'], function(){
    return gulp.src(mainBowerFiles(/* options */), { base: 'bower_components' })
        .pipe(gulp.dest('dist/build/desktop/public/js/bower'))
});

gulp.task('js-files', ['clean'], function(){
    return gulp.src(['app/desktop/**/*.js', 'app/common/**/*.js', 'src/**/desktop/**/*.js'])
        .pipe(gulp.dest('dist/build/desktop/public/js'));
});

gulp.task('i18n', ['clean'], function(){
    return gulp.src(['app/i18n/*.json'])
        .pipe(gulp.dest('dist/build/desktop/public/i18n'));
});

gulp.task('index.html', ['js-files', 'bower-files', 'i18n'], function(){
    return gulp.src(['app/desktop/index.html'])
        .pipe(gulp.dest('dist/build/desktop'));
});

gulp.task('lint', function() {
    return gulp.src(['./**/*.js', '!./bower_components/**', '!./node_modules/**', '!./dist/**'])
        .pipe(jshint())
        .pipe(gulpLogger.jshint);
});

gulp.task('watch', function() {
    gulp.watch(['./**/*.js', '!./bower_components/**', '!./node_modules/**', '!./dist/**'], ['lint']);
});



module.exports= {
    start: function() {
        gulpLogger.gulp(gulp);
        gulp.start(['bower-files', 'js-files', 'i18n', 'lint', 'watch', 'index.html']);
    }
};


//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
//gulp-useref     -> Process assets (js+css) in html