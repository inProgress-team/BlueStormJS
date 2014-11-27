angular.module('bs.tasks', [
    ])


.service('tasksApi', function (socket, frontendAppsApi, projectsApi, serverApi) {

    var service = {};
    service.tasks = {
        count: 0,
        done: 0 
    };

    console.log('2');
    projectsApi.initial(function (first) {
        if(!first) {
            console.log('kill tasks');
            service.kill();
        }
    });

    socket.emit('tasks:isProcessing', function(err, res) {
        if(err) return console.log(err);

        if(res) {
            service.isProcessing = true;
            service.type = res.type;
        } else {
            service.isProcessing = false;
        }
    });

    service.development = function() {
        if(service.isProcessing) return alert('tasks is already processing');

        socket.emit('tasks:development:build', {
            path: projectsApi.project.path,
            apps: frontendAppsApi.getApps()
        }, function () {
            service.type = 'development';
            service.isProcessing = true;
        });
    };

    service.production = function() {

        if(service.isProcessing) return alert('is already processing');
        
        socket.emit('tasks:production:build', {
            path: projectsApi.project.path
        }, function () {
            service.type = 'production';
            service.isProcessing = true;
        });
    };

    service.kill = function(cb) {
        socket.emit('tasks:kill', function(err) {
            if(err) return console.log(err);

            service.isProcessing = false;
            service.tasks = {
                count: 0,
                done: 0 
            };
            if(typeof cb=='function')
                cb();
        });
    };

    socket.on('message_tasks', function (message) {
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

        } else if(message.type=="start_server_request") {
            serverApi.development.start();

        } else if(message.type=="production_built")  {
            service.isProcessing = false;
        }
    });

    return service;
})
.directive('tasksProgress', function(tasksApi) {
    return {
        restrict: "A",
        templateUrl: "modules/tasks/desktop/tasks-progress.tpl.html",
        scope: {
            type: "@tasksProgress"
        },
        link: function (scope) {
            scope.tasksApi = tasksApi;
        }
    };
});