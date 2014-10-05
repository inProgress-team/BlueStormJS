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


        service.login = function(form, cb) {
            $http.post('api/signin', {
                email: form.email,
                password: form.password
            })
                .success(function (data) {
                    if(data.err) return cb('Email ou mot de passe invalide.');


                    service.token = $cookies.bluestorm_token = data.token;
                    service.user = data.user;
                    $state.go('home');
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
