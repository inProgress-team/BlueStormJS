angular.module('panel', [])

    .directive('panel', function() {
        return {
            restrict: "A",
            templateUrl: "panel/panel.tpl.html",
            transclude: true,
            scope: {
            },
            link: function(scope, element, attrs) {
                scope.panelTitle = attrs.panelTitle;
                if(attrs.bodyNoPadding!==undefined) {
                    scope.bodyNoPadding = true;
                } else {
                    scope.bodyNoPadding = false;
                }
            }
        }
    });