angular.module('bluestorm', [
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
    })
    .service('bluestorm', function(){
        var service = {
            urls: {}
        };
        /* @echo appsUrl */

        // @if NODE_ENV='production'
        service.urls['api'] = window.location.protocol + '///* @echo apiConf */:/* @echo mainPort */';
        // @endif
        // @if NODE_ENV='development'
        service.urls['api'] = window.location.protocol + '//' + window.location.hostname+':/* @echo apiConf */';
        // @endif

        // @if NODE_ENV='production'
        service.urls['socket'] = window.location.protocol + '///* @echo socketConf */:/* @echo mainPort */';
        // @endif
        // @if NODE_ENV='development'
        service.urls['socket'] = window.location.protocol + '//' + window.location.hostname+":/* @echo socketConf */";
        // @endif

        return service;
    })
    .factory('socket', function($rootScope, $cookies) {

        // @if NODE_ENV='production'
        var server = window.location.protocol + '///* @echo socketConf */:/* @echo mainPort */';
        // @endif

        // @if NODE_ENV='development'
        var server = window.location.protocol + '//' + window.location.hostname+":/* @echo socketConf */";
        // @endif

        var socket = io(server);
        return {
            on: function(eventName, callback) {
                for(var key in socket._callbacks) {
                    if(key==eventName) {
                        socket.removeListener(key);
                    }
                }
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {

                if (typeof(data) === 'function' || typeof(data) === 'undefined') {
                    callback = data;
                    data = {};
                }
                data.token = $cookies.bluestorm_token;
                /*console.log('-> Event sent : ' + eventName);
                    console.log(data);*/
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    });
