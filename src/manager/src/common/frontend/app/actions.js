angular.module('app.actions', [])



.controller('ActionsCtrl', function ($scope, $mdBottomSheet) {
    $scope.items = [
        { name: 'Create a project', icon: 'plus', id: 'add-project' },
        { name: 'Import a project', icon: 'download', id:'import-project' },
        { name: 'Change project', icon: 'refresh', id:'change-project' }
    ];
    $scope.listItemClick = function(index) {
        $mdBottomSheet.hide($scope.items[index]);
    };
})

.service('actionsApi', function($mdBottomSheet, projectsApi, $cookieStore){
    var service = {};

    service.open = function ($event) {
        $mdBottomSheet.show({
            parent: angular.element(document.getElementById('content')),
            templateUrl: 'common/frontend/app/actions.tpl.html',
            controller: 'ActionsCtrl',
            targetEvent: $event
        }).then(function(clickedItem) {
            if(clickedItem.id == 'add-project') {
                projectsApi.startNew();
            } else if(clickedItem.id == 'import-project') {
                projectsApi.import();
            } else if(clickedItem.id == 'change-project') {
                projectsApi.changeProject();
            }
        });
        /*
        $mdBottomSheet.show({
            parent: angular.element(document.getElementById('content')),
            templateUrl: 'common/frontend/app/actions.tpl.html',
            controller: 'ActionsCtrl',
            targetEvent: $event
        }).then(function(clickedItem) {
            console.log('plouf');
            $log.debug( clickedItem.name + ' clicked!');
        });*/
    }


    return service;    
})
;
