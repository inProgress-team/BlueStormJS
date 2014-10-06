angular.module('bluestorm.user', [
    'ngCookies'
])
    .service('userApi', function UserApi($state, $cookies, $http) {
        var service = {};

        service.token = $cookies.bluestorm_token;
        service.user = null;

        service.getUser = !function() {
            if(!service.token) {
                service.user = null;
                return;
            }

            $http.get('api/user')
                .success(function (data) {
                    if(!data.err) {
                        service.user = data.user;
                    }

                })
                .error(function () {
                    console.log('Erreur inconnue.');
                });
        }();


        service.login = function(url, form, cb) {
            $http.post(url, {
                email: form.email,
                password: form.password
            })
                .success(function (data) {
                    console.log(data);
                    if(data.err) return cb(data.err);


                    service.token = $cookies.bluestorm_token = data.token;
                    service.user = data.user;
                    cb(null, data.user);

                })
                .error(function () {
                    cb('Erreur inconnue.');
                });
        };

        service.logout = function(callback) {
            service.user = null;
            service.token = null;
            delete $cookies.bluestorm_token;
            $state.go('home');
        };

        return service;
    });
