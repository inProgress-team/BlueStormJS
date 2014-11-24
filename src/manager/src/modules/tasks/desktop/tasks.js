angular.module('bs.tasks', [
    ])


.service('tasksApi', function (socket, frontendAppsApi, projectsApi, serverApi) {

    var service = {};
    service.tasks = {
        count: 0,
        done: 0 
    };

    socket.emit('tasks:isProcessing', function(err, res) {
        if(err) return console.log(err);
        service.isProcessing = res;
        console.log(res);
    });

    service.development = function() {
        socket.emit('tasks:development:build', {
            path: projectsApi.project.path,
            apps: frontendAppsApi.getApps()
        }, function () {
            service.isProcessing = true;
        });
    };

    service.kill = function() {
        socket.emit('tasks:kill', function(err) {
            if(err) return console.log(err);

            service.isProcessing = false;
            service.tasks = {
                count: 0,
                done: 0 
            };
        });
    };

    socket.on('message_tasks', function (message) {
        if(message.type=="tasks_executing") {
            service.tasks = {
                count: message.count,
                done: 0 
            };
        } else if(message.type=="task_done") {
            service.tasks.done++;

        } else if(message.type=="tasks_done") {
            service.tasks.seconds = message.seconds;

        }  else if(message.type=="start_server_request") {
            serverApi.development.start();
        }   
    });

    return service;
});