var recursive = require('recursive-readdir'),
    fs = require('fs'),
    async = require('async');

module.exports = {
    getDestDir: function(params) {
        if(process.env.NODE_ENV) {
            params = {env: process.env.NODE_ENV};
        } else if(params===undefined) {
            params = {env:'development'};
        }

        var dir = 'build'
        if(params.env=='production') {
            dir='bin';
        }
        return dir;
    },
    getFrontendApps: function(params) {
        return ['desktop']
    },
    getIncludes: function(params, cb) {
        var res = '<link href="/public/main.css" rel="stylesheet" type="text/css" />\n';
        function appendFile(file) {
            if(file.indexOf('.js')!=-1) {
                res+='\t\t<script type="text/javascript"' +
                    'src="'+file.substring(file.indexOf('/public'))+'"></script>\n';
            } else if(file.indexOf('.css')!=-1) {
                res+='\t\t<link href="'+file.substring(file.indexOf('/public'))+'"' +
                    'rel="stylesheet" type="text/css" />\n';
            }
        }

        async.series([
           function(cb) {
               recursive('dist/build/'+params.appName+'/public/bower_components', function (err, files) {
                   if(err) throw err;


                   files = files.filter(function(file) {
                       if(file.indexOf('.js')!=-1 || file.indexOf('.css')!=-1) return true;
                   });
                   files.forEach(function(file) {
                       appendFile(file);
                   });
                   cb();
               });
           },
            function(cb) {
                recursive('dist/build/'+params.appName, function (err, files) {
                    if(err) return cb(err);

                    files = files.filter(function(file) {
                        if(file.indexOf('bower_components')!=-1) return false;
                        if(file.indexOf('.js')!=-1 && file.indexOf('.json')==-1) return true;
                    });
                    files.forEach(function(file) {
                        appendFile(file);
                    });
                    cb();
                });
            }
        ], function(err) {
            if(err) return cb(err);
            cb(null, res);
        });


    },
    getFrontendBowerComponents: function(env, appName) {
        var dependencies = require(process.cwd()+'/app/'+appName+'/dependencies.json');

        var dirs = ['js', 'js_dev', 'css', 'css_dev'];
        if(env == 'prod') {
            dirs = ['js', 'js_prod', 'css', 'css_prod'];
        }
        var res = [];
        for(var i in dirs) {
            var group = dependencies[dirs[i]];
            for(var j in group) {
                var dep = group[j];
                if(dep.indexOf('bower_components')!=-1) {
                    res.push(dep);
                }
            }
        }
        return res;
    }
};