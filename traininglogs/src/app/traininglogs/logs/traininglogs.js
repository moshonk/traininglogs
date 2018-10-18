angular.module('traininglogs', [
    'ui.bootstrap.dialogs',
    'directives.am.multiselect',
    'directives.sp-peoplepicker',
    'services.utilities',
    'resources.departments',
    'resources.people',
    'resources.trainings',
    'resources.traininglogs'])

.controller('traininglogsCtrl', ['$scope', '$routeParams', '$filter', '$q', '$dialog', '$window', '$dialogConfirm', '$dialogAlert', '$location', 'UtilService', 'ShptRestService', 'Departments', 'People', 'Trainings', 'TrainingLogs', '$http',
    function ($scope, $routeParams, $filter, $q, $dialog, $window, $dialogConfirm, $dialogAlert, $location, UtilService, ShptRestService, Departments, People, Trainings, TrainingLogs, $http) {

        $scope.init = function () {

            // Get this value from the browsers querystring ('id') during an edit operation.
            $scope.traininglogId = $routeParams.id;

            var promises = [];

            promises.push(TrainingLogs.fetchAll());
            promises.push(Departments.fetchAll());
            promises.push(People.fetchAll());
            promises.push(Trainings.fetchAll());
            promises.push(TrainingLogs.getListPermissions());

            $q.all(promises).then(function (promiseResults) {

                $scope.traininglogs = promiseResults[0];

                $scope.departments = promiseResults[1];

                $scope.people = promiseResults[2];

                $scope.trainings = promiseResults[3];

                $scope.permissions = promiseResults[4];

                $scope.setActiveTraininglog();

            }).catch(function (error) {

                $dialogAlert(error, 'Error!!!');

            });

            $scope.personFound = -1;

            $scope.appWebUrl = ShptRestService.appWebUrl;

            $scope.links = UtilService.getAppShortcutlinks();

        };

        $scope.setActiveTraininglog = function () {

            if (!angular.isUndefined($scope.traininglogId)) {

                TrainingLogs.fetchById($scope.traininglogId).then(function (traininglog) {

                    $scope.traininglog = traininglog;

                });

            } else {

                $scope.traininglog = {};
            }

        };

        $scope.addTraininglog = function () {

            $scope.traininglog = {};

            $dialog('app/traininglogs/logs/traininglog-add.tpl.html', 'md').then(function (traininglog) {

                $location.path("/showTraininglog/" + traininglog.id);

            });

            //$location.path("/editTraininglog/" + $scope.traininglog.id);

        };

        $scope.editTraininglog = function (traininglog) {

            var logDataWrapper = { scopeVariableName: 'traininglog', dataObject: traininglog };

            //$dialog('app/traininglogs/logs/traininglog-add.tpl.html', 'lg', logDataWrapper).then(function (traininglog) {
            $dialog('app/traininglogs/logs/traininglog-add.tpl.html', 'lg', logDataWrapper).then(function (traininglog) {

                $location.path("/listTraininglogs/");

            });

        };

        /*
        * Used by the angucomplete-alt directive
        * This function is called whenever a training is selected from the autocomplete box
        */
        $scope.trainingSelected = function (selected) {

            if (selected) {

                $scope.traininglog.training = selected.originalObject;

            }

        };

        /*
        * Used by the angucomplete-alt directive
        * Performs a search on people
        */
        $scope.peopleSearch = function (str, people) {
            var matches = [];

            people.forEach(function (person) {
                var nameAndPayrollNo = person.name + ' ' + person.payrollNo;
                if ((nameAndPayrollNo.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0)) {
                    person.title = person.payrollNo + ' [' + person.name + ']';
                    person.description = person.department.title + ' - ' + person.location.title;
                    matches.push(person);
                }
            });

            return matches;

        };

        this.updateTraininglog = function (traininglog) {

            if (angular.isUndefined(traininglog.facilitator)) {

                $dialogAlert('Unable to save. Training facilitator not selected', "Missing Facilitator");

                return false;

            }

            if (traininglog.target == 'selected' && angular.isUndefined(traininglog.targetDepartment)) {

                $dialogAlert('Unable to save. Target department missing', "Missing Target Department");

                return false;

            }

            TrainingLogs.addLog(traininglog).then(function (traininglog) {

                UtilService.showSuccessMessage('#notification-area', 'Training log updated successfully!!');

                // $location.path("/editTraininglog/" + traininglog.id);

            }).catch(function (error) {

                $dialogAlert(error, "Unable to update Training Log");

            });

        };

        $scope.deleteTraininglog = function (traininglog) {

            if (traininglog) {
                console.log(traininglog)
                if (traininglog.attendances.length > 0) {

                    $dialogAlert('This record has ' + traininglog.attendances.length +
                        ' attendances registered for it. You cannot delete it unless you remove all attendees first.',
                        'Unable to delete record');

                }
                else {

                    $dialogConfirm('Are you sure you want to delete this record (' + traininglog.training.title + ' [' + traininglog.startDate + '] )', 'Delete Training log').then(function () {

                        TrainingLogs.remove(traininglog).then(function () {

                            UtilService.showSuccessMessage('#notification-area', 'Training log deleted successfully!!');

                        }).catch(function (error) {

                            $dialogAlert(error, 'Unable to delete record');

                        });

                    });

                }

            }

        };

        $scope.personSelected = function (selected) {

            if (selected) {

                $scope.personFound = 1;

                $scope.traininglog.attendance.attendee = selected.originalObject;

            } else {

                var newPayrollNo = frm.payrollNo.value;

                $scope.traininglog.attendance.attendee = {};

                $scope.traininglog.attendance.attendee.payrollNo = newPayrollNo;

                $scope.personFound = 0;

            }

        };

        $scope.selectedDepartments = function () {

            return _.map($scope.traininglog.targetDepartment, 'title').join(', ')

        };

        $scope.filterByTrainingDates = function () {

            $scope.traininglogs = _.filter($scope.traininglogs, function (traininglog) {

                return (traininglog.startDate >= $scope.sStartDate && traininglog.startDate <= $scope.sEndDate)

            })

        };

        /*
        *Load the dialog window for adding a new training attendee. 
        *@param {object} Training Log Instance
        */
        $scope.addTrainingattendee = function (traininglog) {

            $scope.traininglog.attendance = {};

            $dialog('app/traininglogs/logs/trainingattendee.tpl.html', 'lg');

        };

        /*
        *Add a new or update an existing training log attendance record. 
        *@param {object} Training Log Instance
        */
        this.updateAttendance = function (traininglog) {

            if (angular.isUndefined(traininglog.attendance.id)) {

                /* 
                 *Check if attendee has already been added to this training.
                */
                if (!TrainingLogs.isPersonInAttendanceList(traininglog, traininglog.attendance.attendee)) {

                    TrainingLogs.addAttendee(traininglog).then(function (attendance) {

                        $scope.traininglog.attendances.push(attendance);

                    }).catch(function (error) {

                        $dialogAlert(error, 'Unable to add attendee')

                    });

                } else {

                    $dialogAlert("(" + traininglog.attendance.attendee.name + " - " + traininglog.attendance.attendee.payrollNo + ") has already been added to this training", "Person already exists");

                }

            }

        };

        /*
        *Remove a person(attendee) from a training log attendance record. 
        *@param {object} Training Log Instance
        */
        $scope.removeAttendee = function (selectedTraininglog, attendance) {

            $dialogConfirm("Are you sure you want to remove " + attendance.attendee.name + " - " + attendance.attendee.payrollNo + " from the attendance list?", "Confirm delete").then(function () {

                TrainingLogs.removeAttendee(selectedTraininglog, attendance).then(function () {

                    UtilService.showSuccessMessage('#notification-area', 'Record deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record!');

                });

            });

        };

        $scope.init();

        $scope.setActiveTraininglog();

        $scope.buttons = [
              { 'name': 'jsontest (Whitelisted)', 'link': 'http://validate.jsontest.com/?json=%7B%22key%22:%22value%22%7D' },
              { 'name': 'Github (Whitelisted)', 'link': '//api.github.com/users/fabpot/repos' },
              { 'name': 'Local request (Whitelisted)', 'link': '/demo.html' },
              { 'name': 'Flickr (Not whitelisted - loader won\'t show)', 'link': 'http://www.flickr.com/services/feeds/photos_public.gne?tags=soccer&format=json' },
        ];

        $scope.makeRequest = function (link) {
            $http.get(link);
        }

    }]);