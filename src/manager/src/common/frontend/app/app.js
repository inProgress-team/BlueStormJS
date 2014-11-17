/**
 * @name songpeek .app
 * @description It handles Songpeek Desktop Application
 *
 */
var songpeek = angular.module('app', [
    'ui.router',
    'pascalprecht.translate',
    'app.handler',
    'cfp.hotkeys'
])
    .config(function(hotkeysProvider) {
        hotkeysProvider.template = '<div class="cfp-hotkeys-container fade" ng-class="{in: helpVisible}" style="display: none;"><div class="cfp-hotkeys">' +
            '<h4 class="cfp-hotkeys-title">{{ title }}</h4>' +
            '<table><tbody>' +
            '<tr ng-repeat="hotkey in hotkeys | filter:{ description: \'!$$undefined$$\' }">' +
            '<td class="cfp-hotkeys-keys">' +
            '<span ng-repeat="key in hotkey.format() track by $index" class="cfp-hotkeys-key">{{ key }}</span>' +
            '</td>' +
            '<td class="cfp-hotkeys-text">{{ hotkey.description | translate }}</td>' +
            '</tr>' +
            '</tbody></table>' +
            '<div class="cfp-hotkeys-close" ng-click="toggleCheatSheet()">×</div>' +
            '</div></div>';
        hotkeysProvider.cheatSheetDescription = 'hotkeys.info'
    })
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
