/**
 * @name songpeek .app
 * @description It handles Songpeek Desktop Application
 *
 */
var songpeek = angular.module('app', [
    'ui.router',
    'pascalprecht.translate',
    'app.actions'
])
.config(function myAppConfig($urlRouterProvider, $locationProvider, $translateProvider) {
    //ROUTES
    $urlRouterProvider.otherwise('/');
    //$locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(true);

    //TRANSLATE
    $translateProvider.useStaticFilesLoader({
        prefix: '/public/i18n/',
        suffix: '.json'
    });

    $translateProvider
        .registerAvailableLanguageKeys(['fr', 'en'], {
            'en_US': 'en',
            'en_UK': 'en',
            'fr_FR': 'fr'
        })
        .determinePreferredLanguage();
    $translateProvider.useCookieStorage();
})


.service('titleApi', function($translate) {

    var service = {};

    service.setPageTitle = function(title, secondTitle) {
        if(secondTitle===undefined) {
            secondTitle='';
        } else {
            secondTitle = secondTitle + " - ";
        }
        if (angular.isDefined(title)) {

            //bad translate
            service.title = secondTitle + title + ' | BlueStorm';
            //good one
            $translate(title).then(function(title) {
                service.title = secondTitle + title + ' | BlueStorm';
            });
        }
    };

    service.title = '';

    return service;
})
;
