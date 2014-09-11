var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    rename = require("gulp-rename"),
    inject = require("gulp-inject"),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    html2js = require('gulp-html2js'),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    cache = require('gulp-cached'),
    watch = require('gulp-watch'),
    preprocess = require('gulp-preprocess');

var config = require(__dirname+'/../../config');

module.exports = function(name) {
    var dependencies = require(process.cwd()+'/src/apps/'+name+'/dependencies.json');

    var cleanTask = 'clean@'+name,
        jsFiles = [
            'src/apps/'+name+'/**/*.js',
            'src/modules/**/'+name+'/**/*.js'
        ];
    dependencies.common.forEach(function (dep) {
        jsFiles.push('src/common/frontend/'+dep+'/**/*.js')
    });

    var templatesFiles = [
            'src/apps/'+name+'/**/*.tpl.html',
            'src/common/frontend/**/*.tpl.html',
            'src/modules/**/'+name+'/**/*.tpl.html'
        ],
        htmlFile = 'src/apps/'+name+'/index.html',
        i18nFiles = [
            'src/common/i18n/*.json'
        ],
        lessFile = 'src/apps/'+name+'/main.less',
        lessFiles = [
            'src/apps/'+name+'/**/*.less',
            'src/common/**/*.less',
            'src/modules/**/'+name+'/**/*.less'
        ],
        sourcesIndex = [

            'dist/build/'+name+'/public/lib/jquery.js',
            'dist/build/'+name+'/public/lib/angular.js',
            'dist/build/'+name+'/public/lib/socket.io.js',

            'dist/build/'+name+'/public/bower_components/**/*.js',
            'dist/build/'+name+'/public/js/**/*.js',
            'dist/build/'+name+'/public/css/main.css'
        ];

    var tasks = {
        jsFiles: function(){
            return gulp.src(jsFiles)
                .pipe(gulp.dest('dist/build/'+name+'/public/js'));
        },
        libJsFiles: function(){
            return gulp.src([
                    __dirname+'/../../../bower_components/jquery/dist/jquery.js',
                    __dirname+'/../../../bower_components/angular/angular.js',
                    __dirname+'/../../../bower_components/socket.io-client/socket.io.js'
                ])
                .pipe(gulp.dest('dist/build/'+name+'/public/lib'));
        },
        html2js: function() {
            gulp.src(templatesFiles)
                .pipe(html2js({
                    outputModuleName: 'templates',
                    base: 'src/'
                }))
                .pipe(concat('templates.js'))
                .pipe(gulp.dest('./dist/build/'+name+'/public/js'))
        },
        i18n: function(){
            return gulp.src(i18nFiles)
                .pipe(gulp.dest('dist/build/'+name+'/public/i18n'));
        },
        bowerFiles: function(){
            return gulp.src(mainBowerFiles(), { base: 'bower_components' })
                .pipe(gulp.dest('dist/build/'+name+'/public/bower_components'))
        },
        frameworkFiles: function(){
            var env = process.env.NODE_ENV,
                envConfig = env;
            if(process.env.NODE_TEST!==undefined) {
                envConfig = 'test';
            }

            var appsUrl = "",
                apps = config.frontend.list();

            apps.forEach(function (app) {
                if(env=="production") {
                    appsUrl += "service.urls."+app+" = 'http://" + config.get(envConfig, app) + ":" + config.get(envConfig, 'main') + "';\n";
                } else if(env=="development") {
                    appsUrl += "service.urls."+app+" = 'http://" + config.get(envConfig, 'main') + ":" + config.get(envConfig, app) + "';\n";
                }
                
            });
            

            return gulp.src(__dirname+'/../../frontend/*.js')
                .pipe(preprocess({context: {
                    NODE_ENV: env,
                    socketConf: config.get(envConfig, 'socket'),
                    apiConf: config.get(envConfig, 'api'),
                    mainPort: config.get(envConfig, 'main'),
                    appsUrl: appsUrl
                }}))
                .pipe(gulp.dest('dist/build/'+name+'/public/js/bluestorm'))
        },
        less: function(){
            gulp.src(lessFile)
                .pipe(less().on('error', function(e) {
                    console.log(e);
                }))
                .pipe(gulp.dest('./dist/build/'+name+'/public/css'));
        },
        indexHtml: function(){
            var sources = gulp.src(sourcesIndex, {read: false});


            return gulp.src(htmlFile)
                .pipe(rename(function (path) { path.basename = "main"; }))
                .pipe(inject(sources, { ignorePath: 'dist/build/'+name }))
                .pipe(gulp.dest('dist/build/'+name));
        },
        lint: function() {
            return gulp.src(jsFiles)
                .pipe(cache('linting'))
                .pipe(jshint())
                .pipe(jshint.reporter(stylish));
        }
    };



    gulp.task('lint@'+name, tasks.lint);

    gulp.task(cleanTask, function(cb) { del(['dist/build/'+name], cb); });

    gulp.task('bower-files@'+name, [cleanTask], tasks.bowerFiles);
    gulp.task('framework-files@'+name, [cleanTask], tasks.frameworkFiles);
    gulp.task('lib-js-files@'+name, [cleanTask], tasks.libJsFiles);


    gulp.task('js-files@'+name, [cleanTask], tasks.jsFiles);
    gulp.task('js-files-watch@'+name, tasks.jsFiles);


    gulp.task('html2js@'+name, [cleanTask], tasks.html2js);
    gulp.task('html2js-watch@'+name, tasks.html2js);

    gulp.task('i18n@'+name, [cleanTask], tasks.i18n);
    gulp.task('i18n-watch@'+name, tasks.i18n);

    gulp.task('less@'+name, [cleanTask], tasks.less);
    gulp.task('less-watch@'+name, tasks.less);



    gulp.task('assets@'+name, [cleanTask], function(){
        return gulp.src('src/common/assets/**/*')
            .pipe(gulp.dest('dist/build/'+name+'/public/assets'))
    });


    gulp.task('index.html@'+name, [
            'js-files@'+name,
            'lib-js-files@'+name,
            'bower-files@'+name,
            'i18n@'+name,
            'less@'+name,
            'html2js@'+name,
            'framework-files@'+name
    ], tasks.indexHtml);
    gulp.task('index.html-watch@'+name, tasks.indexHtml);

    gulp.task('build@'+name, ['index.html@'+name, 'assets@'+name, 'lint@'+name], function() {
        if(process.env.NODE_ENV=='development') {
            gulp.watch(jsFiles, ['js-files-watch@'+name, 'lint@'+name]);
            gulp.watch(templatesFiles, ['html2js-watch@'+name]);
            gulp.watch(i18nFiles, ['i18n-watch@'+name]);
            gulp.watch(lessFiles, ['less-watch@'+name]);
            gulp.watch(htmlFile, ['index.html-watch@'+name]);
        }
    });
};