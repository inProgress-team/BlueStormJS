
angular.module('dialogs',['ui.bootstrap.modal'])

    .service('dialogs',function($modal){

        var service = {};

        var modalInstance;

        service.confirm = function(message, ok, cancel) {
            modalInstance = $modal.open({
                templateUrl: 'common/frontend/dialogs/confirm.tpl.html',
                controller: 'ModalConfirmCtrl',
                size: 'sm',
                resolve: {
                    message: function() {
                        return message;
                    }
                }
            });

            modalInstance.result.then(function () {

                if(typeof(ok)=='function')
                    ok();


            }, function () {
                if(typeof(cancel)=='function')
                    cancel();
            });
        };

        return service;


    })

    .controller('ModalConfirmCtrl', function ($scope, $modalInstance, message) {

        $scope.message = message;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });
