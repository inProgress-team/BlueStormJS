angular.module('badge', [])

    .directive('badge', function() {
        return {
            restrict: "A",
            templateUrl: "badge/badge.tpl.html",
            replace: true,
            scope: {
                count: '=badge',
                warning: '@',
                danger: '@'
            }
        }
    });