/**
 * @name assipe .app
 * @description It handles Songpeek Desktop Application
 *
 */
var assipe = angular.module('assipe', [
        'templates',


        'cfp.hotkeys',
        'sProgress',
        'ui.router',
        'ui.bootstrap',

        'assipe.home',
        'assipe.docunique',
        'assipe.fichep',
        'assipe.user',

        'numberFilters',
        'titleDirective',
        'panel',
        'badge',

        'analytics',
        'angularMoment'

    ])

    .config(function myAppConfig($stateProvider, $urlRouterProvider, $locationProvider) {

        //ROUTES
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        

    })

    .run(function run($rootScope, $state, analytics){

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            analytics.sendPageView();
        });
        moment.lang('fr');

    })

    /**
     * @name AppCtrl
     * @description The controller which contains languages and url states
     */
    .controller('AppCtrl', function AppCtrl($scope, userApi, titleApi, $rootScope) {


        $rootScope.pageTitle = titleApi;

        $scope.userApi = userApi;//TODOSONGPEEK delete others
    })




    .service('titleApi', function() {

        var service = {};

        service.setPageTitle = function(title) {
            if (angular.isDefined(title)) {
                service.title = title+ ' | Assipe';
            }
        };

        service.title = '';

        return service;
    });