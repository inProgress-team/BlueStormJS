angular.module('bs.config', [
	'ui.router',
	'bs.config.frontend-apps'
	])

.service('configApi', function(socket, $cookieStore, frontendAppsApi, projectsApi){
	var service = {};

	projectsApi.initial(function () {
		socket.emit('config:get', projectsApi.project.path, function (err, config) {
			if(err) return console.log(err);

			service.config = config;

			frontendAppsApi.setApps(config.frontendApps);
		});
	});
	

	return service;   
})
;