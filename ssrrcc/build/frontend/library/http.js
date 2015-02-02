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

                        var begin;

                        // @if NODE_ENV='production'
                        if(/* @echo mainPort */==80) {
                            begin = window.location.protocol + '///* @echo apiConf */';
                        } else {
                            begin = window.location.protocol + '///* @echo apiConf */:/* @echo mainPort */';
                        }
                        // @endif
                        // @if NODE_ENV='development'
                        begin = window.location.protocol + '//' + window.location.hostname+':/* @echo apiConf */';
                        // @endif


                        config.url = begin+config.url.substring(3);
                    }
                    return config || $q.when(config);

                }

            }
        });
    });
