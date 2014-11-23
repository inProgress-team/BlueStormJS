angular.module('titleDirective', [])

.directive('pageTitle', function() {
	return {
		restrict: "A",
		templateUrl: "common/frontend/title/title.tpl.html",
		transclude: true
	};
});