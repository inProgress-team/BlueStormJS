angular.module('assipe.fichep', [
    'ui.router'
])



.config(function config($stateProvider) {
    $stateProvider.state('fichep', {
        url: '/fiche-penibilité',
        views: {
            "main": {
                controller: 'FichePCtrl',
                templateUrl: 'fichep/index.tpl.html'
            }
        },
        data: {
            pageTitle: 'Fiche pénibilité'
        }
    });
})

.controller('FichePCtrl', function FichePCtrl($scope) {


});