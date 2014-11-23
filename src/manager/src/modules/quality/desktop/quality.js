angular.module('bs.quality', [
    'ui.router'
])



.config(function config($stateProvider) {
    $stateProvider.state('quality', {
        url: '/quality',
        views: {
            "main": {
                controller: 'QualityCtrl',
                templateUrl: 'modules/quality/desktop/quality.tpl.html'
            }
        },
        data: {
            pageTitle: 'quality'
        }
    });
})

.controller('QualityCtrl', function QualityController($scope, socket, lintApi) {

})

.service('lintApi', function(socket){
    var service = {};


    socket.emit('lint:start', function (err) {
        console.log(err);
    });


    return service;   
});