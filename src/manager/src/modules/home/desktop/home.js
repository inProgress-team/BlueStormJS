angular.module('bs.home', [
    'ui.router'
])



.config(function config($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        views: {
            "main": {
                controller: 'HomeCtrl',
                templateUrl: 'modules/home/desktop/home.tpl.html'
            }
        },
        data: {
            pageTitle: 'home'
        }
    });
})

.controller('HomeCtrl', function HomeController($scope, socket, projectsApi, appsApi) {

    $scope.appsApi = appsApi;


    socket.emit('tasks:isProcessing', function(err, res) {
        if(err) return console.log(err);
        $scope.processing = res;

    });
    $scope.development = function() {
        socket.emit('tasks:development', {
            path: projectsApi.project.path,
            apps: appsApi.getFrontendApps()
        }, function(err) {
            console.log('received');
            if(err) return console.log(err);

            $scope.processing = true;

        });
    };

    $scope.kill = function() {
        socket.emit('tasks:kill', function(err) {
            if(err) return console.log(err);

            $scope.processing = false;

        });
    };

    $scope.msgs = [];
    socket.on('message', function(message) {
        $scope.msgs.push(message);
    });
});