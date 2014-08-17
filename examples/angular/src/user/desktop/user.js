
angular.module( 'assipe.user', [
        'ui.router'
    ])

    .service( 'userApi', function UserApi($state, sProgress) {
        var service = {};

        service.user = {
            role: 'DIRIGEANT'//EMPLOYE
        };

        service.refreshUser = function() {
            /*socket.emit('user:get', {}, function(user) {
                service.user = user;

                //TODOSONGPEEK MUST CHECK
                var current = $state.current.name;
                if(user && (current == 'account.login' || current == 'account.signup')) {
                    $state.go('home');
                }
                if(!user && (current.indexOf('myaccount') != -1 || current.indexOf('contribute') != -1)) {
                    $state.go('account.login');
                }
            });*/
        };

        service.login = function(data, callback) {
            /*sProgress.start();
            socket.emit('user:login', {
                email: data.email,
                password: data.password

            }, function(data){
                sProgress.complete();
                if(data.success !== true) {
                    callback(data.error);
                } else {
                    service.user = data.user;
                    callback(null, data.user);
                }
            });*/
        };

        service.logout = function(callback) {
            /*sProgress.start();
            socket.emit('user:logout', {}, function() {
                sProgress.complete();
                service.user = null;
                callback();
            });*/

        };


        if(!service.user) {
            service.refreshUser();
        }







        return service;
    })
    ;
;