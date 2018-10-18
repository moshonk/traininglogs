angular.module('departments', ['ui.bootstrap.dialogs', 'resources.departments'])

.controller('departmentCtrl', ['$scope', '$log', '$routeParams', '$location', '$dialog', '$dialogConfirm', '$dialogAlert', 'UtilService', 'Departments', function ($scope, $log, $routeParams, $location, $dialog, $dialogConfirm, $dialogAlert, UtilService, Departments) {

    $scope.init = function () {

        Departments.fetchAll().then(function (departments) {

            $scope.departments = departments;

        });

        $scope.links = UtilService.getAppShortcutlinks();

    };

    var departmentId = $routeParams.id;

    if (!angular.isUndefined(departmentId)) { //View existing department 

        departmentId = parseInt($routeParams.id);

        $scope.department = Departments.fetchById(departmentId);

    }

    $scope.addDepartment = function () {

        $scope.department = {};

        $dialog('app/traininglogs/departments/department-add.tpl.html', 'lg').then(function (department) {

            $location.path("/listDepartments/");

        });

    };

    $scope.editDepartment = function (department) {

        var departmentDataWrapper = { scopeVariableName: 'department', dataObject: department };

        $dialog('app/traininglogs/departments/department-add.tpl.html', 'lg', departmentDataWrapper).then(function (department) {

            $location.path("/listDepartments/");

        });

    };

    this.updateDepartment = function (department) {

        Departments.addDepartment(department).then(function (department) {

            UtilService.showSuccessMessage('#notification-area', 'Department updated successfully!!');

        }).catch(function (error) {

            $dialogAlert(error, 'Unable to update department');

        });

    };

    $scope.deleteDepartment = function (department) {

        if (department) {

            $dialogConfirm('Are you sure you want to delete this record (' + department.title + ' )', 'Delete Department').then(function () {

                Departments.remove(department).then(function (data) {

                    $scope.departments = data;

                });

            });

        }

    };

    $scope.deleteDepartment = function (department) {

        if (department) {

            $dialogConfirm('Are you sure you want to delete this record (' + department.title + ' )', 'Delete Department').then(function () {

                Departments.remove(department).then(function (data) {

                    $scope.departments = data;

                    UtilService.showSuccessMessage('#notification-area', 'Department deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record');

                });


            });

        }

    };

    $scope.init();

}]);