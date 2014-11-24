angular.module('bs.server', [
    ])


.service('serverApi', function (socket, frontendAppsApi, projectsApi) {

    var service = {};


    if(projectsApi.project) {
        socket.emit('server:getApps', {path: projectsApi.project.path}, function (err, apps) {
            if(err) return console.log(err);

            service.apps = apps;
        });
    }
    socket.emit('server:isProcessing', function(err, res) {
        if(err) return console.log(err);
        service.isProcessing = res;
        console.log(false);
    });

    service.development = {
        start: function () {
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
        console.log(data);
        if(data.type=="app_started") {
            angular.forEach(service.apps, function (app) {
                if(data.name==app.name) {
                    app.status = 'up';
                    app.port = data.port;
                }
            });
        }
    });
    service.kill = function() {
        socket.emit('server:kill', function(err) {
            if(err) return console.log(err);

            service.isProcessing = false;

            angular.forEach(service.apps, function (app) {
                app.status = 'down';
                app.port = null;
            });
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