angular.module('bs.production', [
    'ui.router'
    ])



.config(function config($stateProvider) {
    $stateProvider.state('production', {
        url: '/production',
        views: {
            "main": {
                controller: 'ProductionCtrl',
                templateUrl: 'modules/production/desktop/production.tpl.html'
            }
        },
        data: {
            pageTitle: 'production'
        }
    });
})

.controller('ProductionCtrl', function ProductionController($scope, socket, projectsApi, tasksApi) {

    $scope.tasksApi = tasksApi;



});