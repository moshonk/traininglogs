angular.module('trainings', ['ui.bootstrap.dialogs', 'resources.trainings'])

.controller('trainingCtrl', ['$scope', '$log', '$routeParams', '$location', '$dialog', '$dialogConfirm', '$dialogAlert', 'UtilService', 'Trainings', function ($scope, $log, $routeParams, $location, $dialog, $dialogConfirm, $dialogAlert, UtilService, Trainings) {

    $scope.init = function () {

        Trainings.fetchAll().then(function (trainings) {

            $scope.trainings = trainings;

        });

        $scope.links = UtilService.getAppShortcutlinks();
    };

    var trainingId = $routeParams.id;

    if (!angular.isUndefined(trainingId)) { //View existing training 

        trainingId = parseInt($routeParams.id);

        $scope.training = Trainings.fetchById(trainingId);

    }

    $scope.addTraining = function () {

        $scope.training = {};

        $dialog('app/traininglogs/trainings/training-add.tpl.html', 'lg').then(function (training) {

            $location.path("/listTrainings/");

        });

    };

    $scope.editTraining = function (training) {

        var trainingDataWrapper = { scopeVariableName: 'training', dataObject: training };

        $dialog('app/traininglogs/trainings/training-add.tpl.html', 'lg', trainingDataWrapper).then(function (training) {

            $location.path("/listTrainings/");

        });

    };

    this.updateTraining = function (training) {

        Trainings.addTraining(training).then(function (training) {

            UtilService.showSuccessMessage('#notification-area', 'Training updated successfully!!');

        }).catch(function (error) {

            $dialogAlert(error, 'Unable to update training');

        });

    };

    $scope.deleteTraining = function (training) {

        if (training) {

            $dialogConfirm('Are you sure you want to delete this record (' + training.title + ' )', 'Delete Training').then(function () {

                Trainings.remove(training).then(function (data) {

                    $scope.trainings = data;

                });

            });

        }

    };

    $scope.deleteTraining = function (training) {

        if (training) {

            $dialogConfirm('Are you sure you want to delete this record (' + training.title + ' )', 'Delete Training').then(function () {

                Trainings.remove(training).then(function (data) {

                    $scope.trainings = data;

                    UtilService.showSuccessMessage('#notification-area', 'Training deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record');

                });


            });

        }

    };

    $scope.init();

}]);