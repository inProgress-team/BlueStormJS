angular.module('bluestorm', [
    'ngCookies',
    'bluestorm.http',
    'bluestorm.user'
])
    .service('bluestorm', function($window){
        var service = {
            urls: {},
            ssl: /* @echo ssl */
        };
        /* @echo appsUrl */

        // @if envConfig='production'
        service.urls['api'] = window.location.protocol + '///* @echo apiUrl */';
        service.urls['socket'] = window.location.protocol + '///* @echo socketUrl */';
        // @endif

        // @if envConfig='development'
        service.urls['api'] = window.location.protocol + '//' + window.location.hostname+':/* @echo apiPort */';
        service.urls['socket'] = window.location.protocol + '//' + window.location.hostname+":/* @echo socketPort */";
        // @endif


        service.env = '/* @echo NODE_ENV */';

        service.app = '/* @echo app */';

        service.getDomains = function () {
            var domains = [];
            for(var i in service.urls) {
                var url = service.urls[i];
                if(i!='socket'&&i!='api') {
                    url = url.substring(7, url.length);
                    url = url.split(':')[0];

                    if(domains.indexOf(url)==-1) {
                        domains.push(url);
                    }
                }

            }
            return domains;
        };



        return service;
    })
    .run(function (bluestorm) {
        if(bluestorm.env=='development') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'http://'+($window.location.hostname||'localhost')+':35729/livereload.js?snipver=1';
            document.body.appendChild(script);
        }
    })
    .factory('socket', function($rootScope, bluestorm, $cookies) {
        var socket = io(bluestorm.urls.socket);
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
                var res = {
                    token: $cookies.get('bluestorm_token'),
                    data: data
                };
                socket.emit(eventName, res, function() {
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
