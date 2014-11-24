
var async = require('async'),
fs = require('fs');

module.exports = function(socket) {
    socket.on('projects:getDefaultPath', function(req, callback) {
        if (typeof callback == 'function') {
            var res = process.cwd()
            res = res.substring(0, res.indexOf('manager'));
            res = res.substring(0, res.lastIndexOf('/'));
            res = res.substring(0, res.lastIndexOf('/'));
            res = res.substring(0, res.lastIndexOf('/'));
            callback(res);
        }
    });
    socket.on('projects:getProjectsDir', function(req, callback) {
        if (typeof callback == 'function') {

            //console.log(req.data);

            walk(req.data, function(err, results) {
                if (err) throw err;

                var res = [];
                async.each(results, function(dir, callback) {


                    async.series([
                        function (callback) {
                            //src dir must exists
                            fs.exists(dir+'/src', function (exists) {
                                if(!exists) return callback(true);
                                callback();
                            });
                        },
                        function (callback) {
                            //and must have common, apps, modules dir
                            fs.readdir(dir+'/src', function (err, files) {
                                if (err) return callback(err);
                                if(files.indexOf('apps')==-1 ||files.indexOf('common')==-1 ||files.indexOf('modules')==-1)
                                    return callback(true);

                                callback();
                            });
                        },
                        function (callback) {
                            //check package.json file
                            fs.readFile(dir+'/package.json', function (err, content) {
                                if(err) return callback(err);

                                var json = JSON.parse(content);
                                console.log(json.name);
                                if(json.name && json.name=='bluestorm')
                                    return callback(true);
                                callback();
                            });
                        }
                        ], function (err) {
                            if(!err) {
                                res.push({
                                    path: dir,
                                    name: 'Songpeek'
                                });
                            }
                            callback();
                        });
}, function(err){
    if( err ) return callback('A file failed to process');
    callback(null, res);
});
});
}
});
};

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                //if directory and not node_module nor bower_components
                if (stat && stat.isDirectory() && file.indexOf('node_modules')==-1 && file.indexOf('bower_components')==-1) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                //if file
            } else {
                    //if package.json
                    if(file.indexOf('package.json')!=-1) {
                        results.push(file.substring(0, file.indexOf('/package.json')));
                    }
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};