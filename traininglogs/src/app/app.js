var app = angular.module('app', [
    'ngRoute',
    'ngAnimate',
    'ng-mfb',
    'ui.bootstrap',
    'ui.bootstrap.dialogs',
    'angucomplete-alt',
    'directives.dirPagination',
    'angular-loading-bar',
    'directives.angular-js-xlsx',
    'ui.grid',
    'ui.grid.exporter',
    'people',
    'trainings',
    'departments',
    'positions',
    'locations',
    'traininglogs',
    'reports']);

app.config(['$routeProvider', function ($routeprovider) {

    $routeprovider.

    /*Begin Staff Members*/
    when('/editPerson/:id', {
        templateUrl: 'app/traininglogs/people/people-edit.tpl.html',
        controller: 'peopleCtrl'
    }).

    when('/addPerson', {
        templateUrl: 'app/traininglogs/people/people-add.tpl.html',
        controller: 'peopleCtrl'
    }).

    when('/listPeople', {
        templateUrl: 'app/traininglogs/people/people-list.tpl.html',
        controller: 'peopleCtrl'
    }).

    when('/importPeople', {
        templateUrl: 'app/traininglogs/people/people-importer.tpl.html',
        controller: 'peopleImporterCtrl'
    }).    
    /*End Staffmembers*/

    /*Begin Departments*/
    when('/editDepartment/:id', {
        templateUrl: 'app/traininglogs/departments/department-edit.tpl.html',
        controller: 'departmentCtrl'
    }).

    when('/addDepartment', {
        templateUrl: 'app/traininglogs/departments/department-add.tpl.html',
        controller: 'departmentCtrl'
    }).

    when('/listDepartments', {
        templateUrl: 'app/traininglogs/departments/department-list.tpl.html',
        controller: 'departmentCtrl'
    }).
    /*End Departments*/

    /*Begin Locations*/
    when('/editLocation/:id', {
        templateUrl: 'app/traininglogs/locations/location-edit.tpl.html',
        controller: 'locationCtrl'
    }).

    when('/addLocation', {
        templateUrl: 'app/traininglogs/locations/location-add.tpl.html',
        controller: 'locationCtrl'
    }).

    when('/listLocations', {
        templateUrl: 'app/traininglogs/locations/location-list.tpl.html',
        controller: 'locationCtrl'
    }).
    /*End Locations*/

    /*Begin Positions*/
    when('/editPosition/:id', {
        templateUrl: 'app/traininglogs/positions/position-edit.tpl.html',
        controller: 'positionCtrl'
    }).

    when('/addPosition', {
        templateUrl: 'app/traininglogs/positions/position-add.tpl.html',
        controller: 'positionCtrl'
    }).

    when('/listPositions', {
        templateUrl: 'app/traininglogs/positions/position-list.tpl.html',
        controller: 'positionCtrl'
    }).
    /*End Positions*/

    /*Begin Trainings*/
    when('/editTraining/:id', {
        templateUrl: 'app/traininglogs/trainings/training-edit.tpl.html',
        controller: 'trainingCtrl'
    }).

    when('/addTraining', {
        templateUrl: 'app/traininglogs/trainings/training-add.tpl.html',
        controller: 'trainingCtrl'
    }).

    when('/listTrainings', {
        templateUrl: 'app/traininglogs/trainings/training-list.tpl.html',
        controller: 'trainingCtrl'
    }).
    /*End Trainings*/

    /*Begin Training logs*/
    when('/editTraininglog/:id', {
        templateUrl: 'app/traininglogs/logs/traininglog-list.tpl.html',
        controller: 'traininglogsCtrl'
    }).

    when('/addTraininglog', {
        templateUrl: 'app/traininglogs/logs/traininglog-add.tpl.html',
        controller: 'traininglogsCtrl'
    }).

    when('/showTraininglog/:id', {
        templateUrl: 'app/traininglogs/logs/traininglog-edit.tpl.html',
        controller: 'traininglogsCtrl'
    }).

    when('/listTraininglogs', {
        templateUrl: 'app/traininglogs/logs/traininglog-list.tpl.html',
        controller: 'traininglogsCtrl'
    }).
    /*End Training logs*/

    when('/reports/trainingattendance', {
        templateUrl: 'app/traininglogs/reports/trainingattendance-report.tpl.html',
        controller: 'reportsCtrl'
    }).

    when('/reports/trainingattendancematrix', {
        templateUrl: 'app/traininglogs/reports/trainingattendance-matrix.tpl.html',
        controller: 'reportsCtrl'
    }).

    otherwise({
        redirectTo: '/listTraininglogs'
    });

}]);
