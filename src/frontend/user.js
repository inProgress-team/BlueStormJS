angular.module('bluestorm.user', [
    'ngCookies'
])
    .service('userApi', function UserApi($state, $cookies, $http) {
        var service = {};

        service.token = $cookies.bluestorm_token;
        service.user = null;

        service.getUser = function(url, cb) {
            if(!service.token) {
                service.user = null;
                return;
            }

            $http.get(url)
                .success(function (data) {
                    if(!data.err) {
                        service.user = data.user;
                    }
                    if(typeof cb == 'function') {
                        cb();
                    }

                })
                .error(function () {
                    if(typeof cb == 'function') {
                        cb('Unknow err.');
                    }
                });
        };


        service.signup = function(url, form, cb) {
            $http.post(url, form)
                .success(function (data) {
                    if(data.err) return cb(data.err);
                    cb(null, data.user);

                })
                .error(function () {
                    cb('Unknown error.');
                });
        };


        service.signin = function(url, form, cb) {
            $http.post(url, {
                email: form.email,
                password: form.password
            })
                .success(function (data) {
                    if(data.err) return cb(data.err);

                    service.token = $cookies.bluestorm_token = data.token;
                    service.user = data.user;
                    $http.defaults.headers.common["X-AUTH-TOKEN"] = $cookies.bluestorm_token;
                    cb(null, data.user);

                })
                .error(function () {
                    cb('Unknown error.');
                });
        };

        service.signout = function() {
            service.user = null;
            service.token = null;
            delete $cookies.bluestorm_token;
        };

        return service;
    });
