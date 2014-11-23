angular.module('bs.tasks', [
    'bs.tasks.development'
])


.service('tasksApi', function (socket, appsApi, projectsApi, serverApi) {

    var service = {};
    service.tasks = {
        count: 0,
        done: 0 
    };

    socket.emit('tasks:isProcessing', function(err, res) {
        if(err) return console.log(err);
        service.isProcessing = res;
    });

    service.development = function() {
        socket.emit('tasks:development:build-server', {
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

    service.on = function (message) {
        console.log(message);
        if(message.type=="tasks_executing") {
            service.tasks = {
                count: message.count,
                done: 0 
            };
        } else if(message.type=="task_done") {
            service.tasks.done++;

        } else if(message.type=="tasks_done") {
            service.tasks.seconds = message.seconds;
            serverApi.development.start();
        }   
    };

    return service;
});