angular.module('songpeek.sockets', [
    ])
    .factory('socket', function ($rootScope) {
        var server = window.location.protocol+'//';
        if(window.location.hostname.split('.').length==2) {//songpeek.com
            server += 'websocket.'+window.location.hostname;

        } else if(window.location.hostname.split('.').length==3) {//xxx.songpeek.com
            server += 'websocket-'+window.location.hostname;
        }


        var socket = io.connect(server, { port: 2052 });
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {

                if(typeof(data)==='function') {
                    callback=data;
                    data = {};
                }

                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });