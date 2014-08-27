var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files');
var stylish = require('jshint-stylish');
var jshint = require('gulp-jshint');

var dir = 'dist/build';


gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['dist'], cb);
});


gulp.task('bower-files', ['clean'], function(){
    return gulp.src(mainBowerFiles(/* options */), { base: 'bower_components' })
        .pipe(gulp.dest('dist/build/desktop/bower'))
});

gulp.task('lint', function() {
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', function() {
    gulp.start(['lint']);
});

module.exports= {
    start: function() {
        gulp.start(function() {
            console.log('complete');
        });
    }
}


//gulp-preprocess -> Environnement <!-- if --> AHAHAH <!--endif -->
//gulp-useref     -> Process assets (js+css) in html