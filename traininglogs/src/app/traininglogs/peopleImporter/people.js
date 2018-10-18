angular.module('people', ['ui.bootstrap.dialogs', 'services.utilities', 'resources.people', 'resources.positions', 'resources.locations', 'resources.departments'])

.controller('peopleCtrl', ['$scope', '$q', '$log', '$timeout', '$routeParams', '$location', '$dialog', '$dialogConfirm', '$dialogAlert', 'UtilService', 'People', 'Locations', 'Positions', 'Departments', function ($scope, $q, $log, $timeout, $routeParams, $location, $dialog, $dialogConfirm, $dialogAlert, UtilService, People, Locations, Positions, Departments) {

    $scope.init = function () {

        var promises = [];

        promises.push(Locations.fetchAll());
        promises.push(Positions.fetchAll());
        promises.push(Departments.fetchAll());
        promises.push(People.fetchAll());

        $q.all(promises).then(function (promiseResponses) {

            $scope.locations = promiseResponses[0];
            $scope.positions = promiseResponses[1];
            $scope.departments = promiseResponses[2];
            $scope.people = promiseResponses[3];

        });

        $scope.links = UtilService.getAppShortcutlinks();

    };

    $scope.addPerson = function () {

        $scope.person = {};

        $dialog('app/traininglogs/people/person-add.tpl.html', 'lg').then(function (person) {

            $location.path("/listPeople/");

        });

    };

    $scope.editPerson = function (person) {

        var personDataWrapper = { scopeVariableName: 'person', dataObject: person };

        $dialog('app/traininglogs/people/person-add.tpl.html', 'lg', personDataWrapper).then(function (person) {

            $location.path("/listPeople/");

        });

    };

    this.updatePerson = function (person) {

        People.addPerson(person).then(function (person) {

            UtilService.showSuccessMessage('#notification-area', 'Person updated successfully!!');

        }).catch(function (error) {

            $dialogAlert(error, 'Unable to update person');

        });

    };

    $scope.deletePerson = function (person) {

        if (person) {

            $dialogConfirm('Are you sure you want to delete this record (' + person.name + ' )', 'Delete Person').then(function () {

                People.remove(person).then(function (data) {

                    $scope.people = data;

                    UtilService.showSuccessMessage('#notification-area', 'Training deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record');

                });;

            });

        }

    };

    $scope.locationSelected = function (selected) {

        if (selected) {

            $scope.person.location = selected.originalObject;

        }

    };

    $scope.positionSelected = function (selected) {

        if (selected) {

            $scope.person.position = selected.originalObject;

        }

    };

    $scope.departmentSelected = function (selected) {

        if (selected) {

            $scope.person.department = selected.originalObject;

        }

    };
    $scope.win = "Yess"
    $scope.readImportFile = function (workbook) {

        alert('Reading file');
        
        var firstSheetName = workbook.SheetNames[0];

        var dataObjects = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {header: ['payrollNo','name','gender','position','department','location'], range: 1});
        
        if (dataObjects.length > 0) {

            $scope.data = dataObjects;
            $scope.win = "Yes"
            $log.debug(dataObjects);
            alert('finiished')
            //$scope.import();

        } else {

            $dialogAlert('Error : No records found !', 'Error while reading file');

        }

    };

    $scope.errorFileImportError = function (e) {

        $log.error(e);

        $dialogAlert(e, 'Error while reading file');

    };

    $scope.import = function () {

        $scope.processing = true;

        People.import($scope.data).then(function () {

            $dialogAlert('Congratulations, the data has been imported successfully', 'Import complete');

            $location.path("/listPeople/");

            $scope.processing = false;
       
        }).catch(function (error) {

            $dialogAlert('Oops!, we had some trouble while importing <br /> ' + error, 'Import Error');

            $scope.processing = false;

        });

    }

    $scope.test = function () {

        People.fetchAll().then(function (departments) {
            var promises = [];
            console.log(departments)
            angular.forEach(departments, function (department, k) {

                promises.push(People.remove(department));

            });

            $q.all(promises).then(function () {

                console.log('deleted!');

            });

        });

        //Departments.findByTitle('STORES & PROCUREMENT').then(function (dept) {
        //    alert('fg')
        //    console.log(dept)

        //}).catch(function (error) {

        //    alert(error)
        //});
    };

    $scope.init();

}]);