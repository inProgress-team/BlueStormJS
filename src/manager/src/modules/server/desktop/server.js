angular.module('bs.server', [
    ])


.service('serverApi', function (socket, frontendAppsApi, projectsApi, $state) {

    var service = {};

    console.log('1');
    projectsApi.initial(function (first) {
        console.log('reload server');

        if(!first) {
            console.log('kill server');
            service.kill(function () {
                console.log('killed')
                $state.go('home');
                socket.emit('server:getApps', {path: projectsApi.project.path}, function (err, apps) {
                    if(err) return console.log(err);
                    console.log(apps);
                    service.apps = apps;
                });
            });
        } else {
            socket.emit('server:getApps', {path: projectsApi.project.path}, function (err, apps) {
                if(err) return console.log(err);
                console.log(apps);
                service.apps = apps;
            });
        }
        
    });

    socket.emit('server:isProcessing', function(err, res) {
        if(err) return console.log(err);
        service.isProcessing = res;
    });
    service.development = {
        start: function () {

            if(service.isProcessing) return alert('server is already processing');

            socket.emit('server:development:start', {
                path: projectsApi.project.path,
                apps: frontendAppsApi.getApps()
            }, function(err) {
                if(err) return console.log(err);

                service.isProcessing = true;
            });

        }
    };

    socket.on('message_server', function (data) {
        if(data.type=="app_started") {
            angular.forEach(service.apps, function (app) {
                if(data.name==app.name) {
                    app.status = 'up';
                    app.port = data.port;
                }
            });
        } else if(data.type=="server_down") {
            angular.forEach(service.apps, function (app) {
                app.status = 'down';
                app.port = null;
            });
        }
    });
    service.kill = function(cb) {
        socket.emit('server:kill', function(err) {
            if(err && typeof cb=='function') return cb(err);

            service.isProcessing = false;

            angular.forEach(service.apps, function (app) {
                app.status = 'down';
                app.port = null;
            });
            if(typeof cb=='function')
                cb();
        });
    };
/*

    service.development = function() {
        socket.emit('server:development', {
            path: projectsApi.project.path,
            apps: appsApi.getFrontendApps()
        }, function () {
            service.isProcessing = true;
        });
    };

    
    };
    */

    return service;
});