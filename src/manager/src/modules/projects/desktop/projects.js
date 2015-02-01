angular.module('bs.projects', [
    'bs.projects.import'
])

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





$scope.user = {
    title: '',
    email: '',
    firstName: '',
    lastName: '' ,
    company: '' ,
    address: '' ,
    city: 'Mountain View' ,
    state: 'CA' ,
    biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
    postalCode : '94043'
  };








})

.service('projectsApi', function(socket, $cookieStore, $state, $mdDialog) {
    var service = {};

    service.splashShown = !$cookieStore.get('project');


    service.project = $cookieStore.get('project') || null;
    service.projects = $cookieStore.get('projects') || [];
    service.changeProjectCallbacks = [];


    service.startNew = function () {

    };
    service.import = function ($event) {

        $mdDialog.show({
          controller: 'ImportDialogCtrl',
          templateUrl: 'modules/projects/desktop/import/import-modal.tpl.html',
          targetEvent: $event
        })
        .then(function(projects) {
            angular.forEach(projects, function(project) {
                service.add(project);
            });
            service.changeProject();
        });
    };

    service.changeProject = function () {
        service.project = null;
        $cookieStore.remove('project');
    };


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
        
        angular.forEach(service.changeProjectCallbacks, function (cb) {
            if(service.project) {
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
})



.directive('noProject', function(){
    return {
        templateUrl: 'modules/projects/desktop/no-project.tpl.html',
        replace: true
    };
})


.directive('newProject', function(){
    return {
        templateUrl: 'modules/projects/desktop/new/new.tpl.html',
        replace: true
    };
})

.directive('importProject', function(){
    return {
        controller: 'ProjectsImportCtrl',
        templateUrl: 'modules/projects/desktop/import/import.tpl.html',
        replace: true
    };
})
;