angular.module('bluestorm.http', [
    'ngCookies'
])
    .run(function ($http, $cookies) {
        $http.defaults.headers.common["X-AUTH-TOKEN"] = $cookies.bluestorm_token;
    })
    .config(function ($httpProvider, bluestorm) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    if(config.url.indexOf('api')===0) {

                        var url = config.url.substring(3);
                        url = bluestorm.urls['api']+url;

                        config.url = url;
                    }
                    return config || $q.when(config);

                }

            }
        });
    });
