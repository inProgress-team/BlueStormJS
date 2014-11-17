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
            $scope.importProgressPath=path.substring(0, path.indexOf('/manager'));
        });
        $scope.searchProjects = function() {
            projectsApi.getProjectsDir($scope.importForm.path, function(err, projects) {
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


    service.add = function(project) {
        service.projects.push({
            name: project.name,
            path: project.path
        });
        $cookieStore.put('projects', service.projects);
    };

    service.set = function(index) {
        service.project = service.projects[index];
        $cookieStore.put('project', service.project);
        $state.go('home');
    };

    service.remove = function(index) {
        service.projects.splice(index,1);
        $cookieStore.put('projects', service.projects);
    };





    service.getProjectsDir = function(path, cb) {
        socket.emit('projects:getProjectsDir', path, cb);
    };

    return service;
});