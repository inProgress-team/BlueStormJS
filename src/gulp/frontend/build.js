var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    rename = require("gulp-rename"),
    inject = require("gulp-inject"),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    html2js = require('gulp-html2js'),
    stylish = require('jshint-stylish'),
    cache = require('gulp-cached'),
    watch = require('gulp-watch'),
    preprocess = require('gulp-preprocess'),
    gulpFilter = require('gulp-filter'),
    changed = require('gulp-changed');

var config = require(__dirname+'/../../config');

module.exports = function(name) {
    var dependencies = require(process.cwd()+'/src/apps/'+name+'/dependencies.json');

    var cleanTask = 'clean@'+name,
    jsFiles = [
    'src/apps/'+name+'/**/*.js',
    'src/modules/**/'+name+'/**/*.js'
    ],
    commonJsFiles= [],
    commonJsFilesAll = ['src/common/frontend/**/*.js'];
    dependencies.common.forEach(function (dep) {
        commonJsFiles.push(dep+'/**/*.js')
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
    'dist/build/'+name+'/public/js/templates.js',
    'dist/build/'+name+'/public/js/**/*.js',
    'dist/build/'+name+'/public/css/main.css'
    ],
    assets = 'src/common/assets/**/*';

    var tasks = {
        jsFiles: function(){
            var dest = 'dist/build/'+name+'/public/js/modules';
            return gulp.src(jsFiles)
            .pipe(changed(dest))
            .pipe(gulp.dest(dest));
        },
        commonJsFiles: function(){
            var dest = 'dist/build/'+name+'/public/js/common';
            return gulp.src(commonJsFilesAll)
            .pipe(gulpFilter(commonJsFiles))
            .pipe(changed(dest))
            .pipe(gulp.dest(dest));
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
            return gulp.src(templatesFiles)
            .pipe(html2js({
                outputModuleName: 'templates',
                base: 'src/'
            }))
            .pipe(concat('templates.js'))
            .pipe(gulp.dest('./dist/build/'+name+'/public/js'));
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
            if(env=='preproduction') {
                envConfig = 'production';
            }

            var appsUrl = "",
                apps = config.frontend.list();

            apps.forEach(function (app) {
                if(env=="production" || env=='preproduction') {
                    appsUrl += ("service.urls."+app+" = window.location.protocol+'//"+config.get(env, app).url + "';\n");

                } else if(env=="development") {
                    appsUrl += "service.urls."+app+" = window.location.protocol+'//127.0.0.1:" + config.get(env, app) + "';\n";
                }
            });
            

            return gulp.src(__dirname+'/../../frontend/*.js')
            .pipe(preprocess({context: {
                NODE_ENV: env,
                envConfig: envConfig,
                appsUrl: appsUrl,
                ssl: config.isSsl(),
                app: name,

                socketUrl: config.get(envConfig, 'socket').url,
                apiUrl: config.get(envConfig, 'api').url,

                socketPort: config.get(envConfig, 'socket'),
                apiPort: config.get(envConfig, 'api')
            }}))
            .pipe(gulp.dest('dist/build/'+name+'/public/js/bluestorm'))
        },
        less: function(){
            var l = less({});
            l.on('error',function(e){
                console.log(e);
                l.emit('end');
            });
            return gulp.src(lessFile)
            .pipe(l)
            .pipe(gulp.dest('./dist/build/'+name+'/public/css'));

            return less;
        },
        indexHtml: function(){
            var sources = gulp.src(sourcesIndex, {
                read: false
            });

            return gulp.src(htmlFile)
            .pipe(rename(function (path) { path.basename = "main"; }))
            .pipe(inject(sources, { ignorePath: 'dist/build/'+name }))
            .pipe(gulp.dest('dist/build/'+name));
        },
        assets: function() {
            var dest = 'dist/build/'+name+'/public/assets';
            return gulp.src(assets)
            .pipe(changed(dest))
            .pipe(gulp.dest(dest))
        }
    };


    gulp.task(cleanTask, function(cb) { del(['dist/build/'+name], cb); });

    gulp.task('bower-files@'+name, [cleanTask], tasks.bowerFiles);
    gulp.task('framework-files@'+name, [cleanTask], tasks.frameworkFiles);
    gulp.task('lib-js-files@'+name, [cleanTask], tasks.libJsFiles);


    gulp.task('js-files@'+name, [cleanTask], tasks.jsFiles);
    gulp.task('js-files-watch@'+name, tasks.jsFiles);
    gulp.task('js-file-added@'+name, ['js-files-watch@'+name], tasks.indexHtml);

    gulp.task('common-js-files@'+name, [cleanTask], tasks.commonJsFiles);
    gulp.task('common-js-files-watch@'+name, tasks.commonJsFiles);
    gulp.task('common-js-files-added@'+name, ['common-js-files-watch@'+name], tasks.indexHtml);


    gulp.task('html2js@'+name, [cleanTask], tasks.html2js);
    gulp.task('html2js-watch@'+name, tasks.html2js);

    gulp.task('i18n@'+name, [cleanTask], tasks.i18n);
    gulp.task('i18n-watch@'+name, tasks.i18n);

    gulp.task('less@'+name, [cleanTask], tasks.less);
    gulp.task('less-watch@'+name, tasks.less);



    gulp.task('assets@'+name, [cleanTask], tasks.assets);
    gulp.task('assets-watch@'+name, tasks.assets);


    gulp.task('index.html@'+name, [
        'js-files@'+name,
        'common-js-files@'+name,
        'lib-js-files@'+name,
        'bower-files@'+name,
        'i18n@'+name,
        'less@'+name,
        'html2js@'+name,
        'framework-files@'+name
        ], tasks.indexHtml);
    gulp.task('index.html-watch@'+name, tasks.indexHtml);


    gulp.task('build@'+name, ['index.html@'+name,'assets@'+name], function() {
        if(process.env.NODE_ENV=='development') {
            gulp.watch(jsFiles, function(file) {
                gulpWatch.jsFiles(file, name);
            });
            gulp.watch(commonJsFilesAll, function(file) {
                gulpWatch.commonJsFilesAll(file, name);
            });
            gulp.watch(templatesFiles, function(file) {
                gulp.start('html2js-watch@'+name);
            });
            gulp.watch(assets, function(file) {
                gulpWatch.assets(file, name);
            });
            gulp.watch(i18nFiles, ['i18n-watch@'+name]);
            gulp.watch(lessFiles, ['less-watch@'+name]);
            gulp.watch(htmlFile, ['index.html-watch@'+name]);
        }
    });
};

var gulpWatch = {
    assets: function(file, name) {
        console.log(file.type);
        if(file.type=='deleted') {
            var pathToDelete = file.path.substring(file.path.indexOf('src/common')+11);
            console.log("dist/build/"+name+"/public/"+pathToDelete);
            del("dist/build/"+name+"/public/"+pathToDelete);
        } else {
            gulp.start('assets-watch@'+name);
        }
    },
    jsFiles: function(file, name) {
        if(file.type=='changed') {
            gulp.start(['js-files-watch@'+name]);
        }
        if(file.type=='added'||file.type=='renamed') {
            gulp.start(['js-file-added@'+name]);
        }
        if(file.type=='deleted') {
            var pathToDelete = file.path.substring(file.path.indexOf('src/modules/')+12);
            del("dist/build/"+name+"/public/js/modules/"+pathToDelete, function(err) {
                gulp.start('index.html-watch@'+name);
            });

        }
    },
    commonJsFilesAll: function(file, name) {
        if(file.type=='changed') {
            gulp.start(['common-js-files-watch@'+name]);
        }
        if(file.type=='added'||file.type=='renamed') {
            gulp.start(['common-js-files-added@'+name]);
        }
        if(file.type=='deleted') {
            var pathToDelete = file.path.substring(file.path.indexOf('src/common/frontend')+20);
            console.log("dist/build/"+name+"/public/js/common/"+pathToDelete);
            del("dist/build/"+name+"/public/js/common/"+pathToDelete, function(err) {
                if(err) return console.error(err);
                gulp.start('index.html-watch@'+name);
            });

        }
    },
};