angular.module('assipe.docunique', [
    'ui.router'
])
.config(function config($stateProvider) {
    $stateProvider.state('docunique', {
        url: '/document-unique',
        views: {
            "main": {
                controller: 'DocUniqueCtrl',
                templateUrl: 'document-unique/document-unique.tpl.html'
            }
        },
        data: {
            pageTitle: 'Fiche pénibilité'
        }
    });
})

.controller('DocUniqueCtrl', function DocUniqueCtrl($scope, $http, preventions) {

    $http({method:'GET', url:'http://dev.songpeek.com:3000/document-unique'})
        .success(function(data, status, headers, config) {
                console.log(data);
        })
        .error(function(data, status, headers, config) {
            console.log('error');
        });


})
;