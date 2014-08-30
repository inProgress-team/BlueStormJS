angular.module('socket-io', [])
    .factory('socket', function($rootScope) {
        var server = window.location.protocol + '//';

        var isProd = true;

        if (isProd) {
            if (window.location.hostname.split('.').length == 2) { //hostname.com
                server += 'socket.';

            } else if (window.location.hostname.split('.').length == 3) { //xxx.hostname.com
                server += 'socket-';
            }
        }
        server += window.location.hostname;

        if (isProd) {
            server += ":8000";
        } else {
            server += ":8888";
        }

        var socket = io(server);
        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {

                if (typeof(data) === 'function') {
                    callback = data;
                    data = {};
                }

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
