angular.module('bs.projects', [])

.config(function config($stateProvider) {
    $stateProvider.state('projects', {
        url: '/projects',
        views: {
            "main": {
                controller: 'ProjectsCtrl',
                templateUrl: 'modules/projects/desktop/projects.tpl.html'
            }
        },
        data: {
            pageTitle: 'projects'
        }
    });
})

.controller('ProjectsCtrl', function ProjectsController($scope, projectsApi, socket) {
    $scope.projectsApi = projectsApi;


    $scope.importProjects = [];
    socket.emit('projects:getDefaultPath', function(path) {
        console.log(path);
        $scope.importProgressPath=path;
    });
    $scope.searchProjects = function() {
        projectsApi.getProjectsDir($scope.importForm.path.$viewValue, function(err, projects) {
            if(err) return console.log(err);

            var res = [];
            angular.forEach(projects, function(project) {
                project.active = true;
                res.push(project);
            });
            $scope.importProjects = res;
        });
    };
    $scope.import = function() {
        angular.forEach($scope.importProjects, function(project) {
            if(project.active) {
                projectsApi.add(project);
            }
        });
    };
})

.service('projectsApi', function(socket, $cookieStore, $state) {
    var service = {};

    service.project = $cookieStore.get('project') || null;
    service.projects = $cookieStore.get('projects') || [];
    service.changeProjectCallbacks = [];

    service.add = function(project) {
        service.projects.push({
            name: project.name,
            path: project.path
        });
        $cookieStore.put('projects', service.projects);
    };

    service.set = function(index) {
        angular.forEach(service.projects, function(p) {
            p.active = false;
        });
        service.projects[index].active = true;
        service.project = service.projects[index];
        $cookieStore.put('project', service.project);
        $cookieStore.put('projects', service.projects);
        
        console.log(service.changeProjectCallbacks);
        angular.forEach(service.changeProjectCallbacks, function (cb) {
            console.log('plouf');
            if(service.project) {
                console.log('a');
                cb();
            }
        });
    };

    service.remove = function(index) {
        service.projects.splice(index,1);
        $cookieStore.put('projects', service.projects);
    };

    service.initial = function (cb) {
        if(typeof cb=='function') {
            if(service.project) {
                cb(true);
            }
            service.changeProjectCallbacks.push(cb);
        }
    }





    service.getProjectsDir = function(path, cb) {
        socket.emit('projects:getProjectsDir', path, cb);
    };

    return service;
});