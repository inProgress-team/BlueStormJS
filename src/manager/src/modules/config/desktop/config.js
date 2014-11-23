angular.module('bs.config', [
    'ui.router',
    'bs.config.apps'
])

.service('configApi', function(socket, $cookieStore, appsApi, projectsApi){
    var service = {};

    socket.emit('config:get', projectsApi.project.path, function (err, config) {
        if(err) return console.log(err);

        service.config = config;

        appsApi.setFrontendApps(config.frontendApps);
        
    });

    return service;   
})
;