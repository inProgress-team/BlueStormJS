angular.module('bs.config.apps', [
])
.service('appsApi', function($cookieStore){
    var service = {};
    
    service.setFrontendApps = function (apps) {
        service.frontendApps = [];


        angular.forEach(apps, function (app) {

            var checked = true;
            angular.forEach($cookieStore.get('frontendApps'), function (appCookie) {
                if(appCookie.name==app) {
                    checked = appCookie.checked;
                }
            });

            service.frontendApps.push({
                name: app,
                checked: checked
            });
        });
    };
    service.getFrontendApps = function () {
        var res = [];
        angular.forEach(service.frontendApps, function (app) {
            if(app.checked) {
                res.push(app.name);
            }
        });
        return res;
    };

    service.frontendAppsChange = function () {
        $cookieStore.put('frontendApps', service.frontendApps);
    };

    return service;  
});