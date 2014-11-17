angular.module( 'forms', [
])

    .directive('ensureUniqueEmail', function(socket) {
        return {
            require: 'ngModel',
            link: function(scope, ele, attrs, ctrl) {
                scope.$watch(attrs.ngModel, function(email) {

                    if(email) {
                        socket.emit('user:ensure-unique-email', email, function(err){
                            if(err===undefined) {
                                ctrl.$setValidity('unique', true);
                            } else {
                                ctrl.$setValidity('unique', false);
                            }
                        });
                    } else {
                        //in case of other validations set to false
                        ctrl.$setValidity('unique', true);
                    }
                });

            }
        };
    })
    .directive("match-input", function ($parse) {
        return {
            restrict: 'A',
            scope: {
                match: '='
            },
            require: 'ngModel',
            link: function link(scope, elem, attrs, ngModel) {
                scope.$watch('match', function(pass){
                    ngModel.$validate();
                });
                ngModel.$validators.match = function(modelValue, viewValue){
                    var value = modelValue || viewValue;
                    var match = scope.match;
                    return value === match;
                };
            }
        };
    })
;

