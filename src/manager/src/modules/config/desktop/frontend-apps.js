angular.module('bs.config.frontend-apps', [
	])
.service('frontendAppsApi', function($cookieStore){
	var service = {};

	service.setApps = function (apps) {
		service.apps = [];


		angular.forEach(apps, function (app) {

			var checked = true;
			angular.forEach($cookieStore.get('frontendApps'), function (appCookie) {
				if(appCookie.name==app) {
					checked = appCookie.checked;
				}
			});

			service.apps.push({
				name: app,
				checked: checked
			});
		});
	};
	service.getApps = function () {
		var res = [];
		angular.forEach(service.apps, function (app) {
			if(app.checked) {
				res.push(app.name);
			}
		});
		return res;
	};

	service.appsChange = function () {
		$cookieStore.put('frontendApps', service.apps);
	};

	return service;  
})

.directive('frontendAppsChooser', function(frontendAppsApi) {
	return {
		restrict: "A",
		templateUrl: "modules/config/desktop/frontend-apps-chooser.tpl.html",
		scope: { },
		link: function (scope) {
			scope.frontendAppsApi = frontendAppsApi;
		}
	};
})