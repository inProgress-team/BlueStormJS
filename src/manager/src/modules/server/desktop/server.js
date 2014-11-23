angular.module('bs.server', [
])


.service('serverApi', function (socket, appsApi, projectsApi) {

    var service = {};
    service.apps = [{
        name: 'api',
        status: 'up'
    }, {
        name: 'socket',
        status: 'down'
    },{
        name: 'desktop',
        status: 'down'
    }, {
        name: 'admin',
        status: 'down'
    }];

    service.development = {
        start: function () {
            console.log('starting server');
            socket.emit('server:development:start', function(err) {
                console.log('server started');
            });
        }
    }
/*
    socket.emit('tasks:isProcessing', function(err, res) {
        if(err) return console.log(err);
        service.isProcessing = res;
    });

    service.development = function() {
        socket.emit('server:development', {
            path: projectsApi.project.path,
            apps: appsApi.getFrontendApps()
        }, function () {
            service.isProcessing = true;
        });
    };

    service.kill = function() {
        socket.emit('tasks:kill', function(err) {
            if(err) return console.log(err);

            service.isProcessing = false;
        });
    };
*/
    service.on = function (message) {
        
        /*if(message.type=="tasks_executing") {
            service.tasks = {
                count: message.count,
                done: 0 
            };
        } else if(message.type=="task_done") {
            service.tasks.done++;

        } else */
    };

    return service;
});