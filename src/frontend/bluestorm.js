angular.module('bluestorm', [
    'ngCookies',
    'bluestorm.http',
    'bluestorm.user'
    ])
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
                var res = {
                    token: $.cookie('bluestorm_token'),
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



/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));
