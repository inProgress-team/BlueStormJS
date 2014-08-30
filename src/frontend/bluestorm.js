angular.module('bluestorm', [])
    .factory('socket', function($rootScope) {

        // @if NODE_ENV='production'
        var server = window.location.protocol + '///* @echo socketConf */:/* @echo mainPort */';
        // @endif

        // @if NODE_ENV='development'
        var server = window.location.protocol + '//' + window.location.hostname+":/* @echo socketConf */";
        // @endif

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
