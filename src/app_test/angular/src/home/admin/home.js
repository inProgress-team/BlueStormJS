angular.module('assipe.home', [
    'ui.router'
])



    .config(function config($stateProvider) {
        $stateProvider.state('home', {
            url: '/',
            views: {
                "main": {
                    controller: 'HomeCtrl',
                    templateUrl: 'home/home.tpl.html'
                }
            },
            data: {
                pageTitle: 'home'
            }
        });
    })

    .controller('HomeCtrl', function HomeController($scope) {


    });