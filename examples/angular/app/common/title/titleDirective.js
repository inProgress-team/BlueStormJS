angular.module('titleDirective', [])

    .directive('pageTitle', function() {
        return {
            restrict: "A",
            templateUrl: "title/title.tpl.html",
            transclude: true
        }
    });