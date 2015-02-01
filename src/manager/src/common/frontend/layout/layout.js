
angular.module('layout',[])
    .directive('layoutLeft', function(){
        return {
            templateUrl: 'common/frontend/layout/left.tpl.html',
            replace: true
        };
    })
    .directive('layoutToolbarRight', function(){
        return {
            templateUrl: 'common/frontend/layout/toolbar-right.tpl.html',
            replace: true,
            transclude: true
        };
    })
;
