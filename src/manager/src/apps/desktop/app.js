/**
 * @name songpeek .app
 * @description It handles Songpeek Desktop Application
 *
 */
 var songpeek = angular.module('bs', [
    'bluestorm',
    'templates',
    'app',

    'ui.router',
    'ui.bootstrap',
    'pascalprecht.translate',
    'titleDirective',
    'angularMoment',

    'bs.projects',
    'bs.home',
    'bs.quality',
    'bs.config',
    'bs.tasks',
    'bs.server'


    ])

/**
 * @name AppCtrl
 * @description The controller which contains languages and url states
 */
 .controller('AppCtrl', function AppCtrl($scope, titleApi, $rootScope, $document, $translate, $state, hotkeys, projectsApi, configApi) {


    $rootScope.$state = $state;
    $rootScope.lang = $translate.storage().get( $translate.storageKey())||$translate.preferredLanguage();
    $scope.projectsApi = projectsApi;

    $rootScope.pageTitle = titleApi;

    $scope.$on('$stateChangeSuccess', function(event, toState) {
        titleApi.setPageTitle(toState.data.pageTitle);
        if(!projectsApi.project) {
            $state.go('projects');
        }
    });
});
