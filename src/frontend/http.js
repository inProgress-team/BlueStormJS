angular.module('bluestorm.http', [
    'ngCookies'
])
    .run(function ($http, $cookies) {
        $http.defaults.headers.common["X-AUTH-TOKEN"] = $cookies.bluestorm_token;
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    if(config.url.indexOf('api')===0) {

                        /**
                         * URLS
                         */
                        var url = config.url.substring(3);
                        // @if NODE_ENV='production'
                        url = window.location.protocol + '///* @echo apiConf */:/* @echo mainPort */'+url;
                        // @endif

                        // @if NODE_ENV='development'
                        url = window.location.protocol + '//' + window.location.hostname+':/* @echo apiConf */'+url;
                        // @endif

                        config.url = url;


                        /**
                         * URLS
                         */
                    }
                    return config || $q.when(config);

                }

            }
        });
    });
