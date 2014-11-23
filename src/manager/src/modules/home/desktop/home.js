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

.controller('HomeCtrl', function HomeController($scope, socket, projectsApi, appsApi, tasksApi, serverApi) {

    $scope.appsApi = appsApi;
    $scope.tasksApi = tasksApi;
    $scope.serverApi = serverApi;
});