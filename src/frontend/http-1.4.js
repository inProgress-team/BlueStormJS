angular.module('bluestorm.http', [
    'ngCookies'
])
    .run(function ($http, $cookies) {
        $http.defaults.headers.common["X-AUTH-TOKEN"] = $cookies.get('bluestorm_token');
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    if(config.url.indexOf('api')===0) {

                        var begin;

                        // @if envConfig='production'
                        begin = window.location.protocol + '///* @echo apiUrl */';
                        // @endif
                        // @if envConfig='development'
                        begin = window.location.protocol + '//' + window.location.hostname+':/* @echo apiPort */';
                        // @endif


                        config.url = begin+config.url.substring(3);
                    }
                    return config || $q.when(config);

                }

            }
        });
    });
