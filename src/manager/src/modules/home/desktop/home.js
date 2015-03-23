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

.controller('HomeCtrl', function HomeController($scope, socket, projectsApi, tasksApi, serverApi) {
    console.log('home')
    $scope.tasksApi = tasksApi;
    $scope.serverApi = serverApi;

});