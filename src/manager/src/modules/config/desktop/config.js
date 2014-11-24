angular.module('bs.config', [
	'ui.router',
	'bs.config.apps',
	'bs.config.frontend-apps'
	])

.service('configApi', function(socket, $cookieStore, frontendAppsApi, projectsApi){
	var service = {};

	if(projectsApi.project) {
		socket.emit('config:get', projectsApi.project.path, function (err, config) {
			if(err) return console.log(err);

			service.config = config;

			frontendAppsApi.setApps(config.frontendApps);
		});
	}
	

	return service;   
})
;