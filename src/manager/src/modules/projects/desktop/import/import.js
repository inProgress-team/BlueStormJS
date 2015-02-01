angular.module('bs.projects.import', [])
.controller('ImportDialogCtrl', function ($scope, socket, $mdDialog, projectsApi) {

    $scope.projects = [];


    socket.emit('projects:getDefaultPath', function(path) {
        $scope.importProgressPath=path;
    });
    $scope.searchProjects = function() {
        projectsApi.getProjectsDir($scope.importForm.path.$viewValue, function(err, projects) {
            if(err) return console.log(err);

            var res = [];
            angular.forEach(projects, function(project) {
                project.activated = true;
                res.push(project);
            });

            $scope.projects = res;
        });
    };

    $scope.hide = function() {
        var res = [];
        angular.forEach($scope.projects, function (p) {
            if(p.activated) {
                delete p.activated;
                res.push(p);
            };
        });

        $mdDialog.hide(res);
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
})
;