/**
* @name songpeek .app
* @description It handles Songpeek Desktop Application
*
*/
var songpeek = angular.module('bs', [
	'bluestorm',
	'templates',
	'app',
	'layout',

	'ui.router',
	'pascalprecht.translate',

	'bs.projects',
	'bs.home',
	'bs.quality',
	'bs.config',
	'bs.tasks',
	'bs.server',
	'bs.production',

	'ngMaterial'
	])


.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('green', {
    	'default': '500',
    	'hue-1': '200'
    });
})

/**
* @name AppCtrl
* @description The controller which contains languages and url states
*/
.controller('AppCtrl', function AppCtrl(actionsApi, $mdSidenav, $scope, titleApi, $rootScope, $document, $translate, $state, projectsApi, configApi, serverApi, tasksApi, $mdBottomSheet) {


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

	$rootScope.toggleSidenav = function( name ) {
		$mdSidenav(name).toggle();
	}

	$scope.showActions = function($event) {
		actionsApi.open($event);
	};

});
