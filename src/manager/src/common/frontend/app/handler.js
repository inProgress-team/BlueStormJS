/**
 * @name songpeek .app
 * @description It handles Songpeek Desktop Application
 *
 */
var songpeek = angular.module('app.handler', [
    'ui.router'
])

    .config(function config($stateProvider) {
        $stateProvider.state('errorHandler', {
            url: '/errorHandler/{error}',
            views: {
                "main": {
                    templateUrl: 'common/frontend/app/error-handler.tpl.html',
                    controller: 'HandlerCtrl'
                }
            },
            data: {
                pageTitle: 'error'
            }
        });
    })

    .service('handler', function($state) {
        var service = {};

        service.error = function(error) {
            var err;
            if(error!==undefined) {
                err = error;
            } else {
                err = 'error.unknown';
            }

            $state.go('errorHandler', {
                error: err
            }, {
                location: false
            });
            console.error(err);
        };

        return service;
    })
    .controller('HandlerCtrl', function($scope, $state) {
        $scope.error = $state.params.error;
    });
