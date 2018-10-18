angular.module('positions', ['ui.bootstrap.dialogs', 'resources.positions'])

.controller('positionCtrl', ['$scope', '$log', '$routeParams', '$location', '$dialog', '$dialogConfirm', '$dialogAlert', 'UtilService', 'Positions',
    function ($scope, $log, $routeParams, $location, $dialog, $dialogConfirm, $dialogAlert, UtilService, Positions) {
    
    $scope.init = function () {

        Positions.fetchAll().then(function (positions) {

            $scope.positions = positions;

        });

        $scope.links = UtilService.getAppShortcutlinks();

    };

    var positionId = $routeParams.id;

    if (!angular.isUndefined(positionId)) { //View existing position 

        positionId = parseInt($routeParams.id);

        $scope.position = Positions.fetchById(positionId);

    }

    $scope.addPosition = function () {

        $scope.position = {};

        $dialog('app/traininglogs/positions/position-add.tpl.html', 'lg').then(function (position) {

            $position.path("/listPositions/");

        });

    };

    $scope.editPosition = function (position) {
        
        var positionDataWrapper = { scopeVariableName: 'position', dataObject: position };

        $dialog('app/traininglogs/positions/position-add.tpl.html', 'lg', positionDataWrapper).then(function (position) {

            $position.path("/listPositions/");

        });

    };

    this.updatePosition = function (position) {

        Positions.addPosition(position).then(function (position) {

            UtilService.showSuccessMessage('#notification-area', 'Position updated successfully!!');

        }).catch(function (error) {

            $dialogAlert(error, 'Unable to update position');

        });

    };

    $scope.deletePosition = function (position) {

        if (position) {

            $dialogConfirm('Are you sure you want to delete this record (' + position.title + ' )', 'Delete Position').then(function () {

                Positions.remove(position).then(function (data) {

                    $scope.positions = data;

                });

            });
            
        }

    };

    $scope.deletePosition = function (position) {

        if (position) {

            $dialogConfirm('Are you sure you want to delete this record (' + position.title + ' )', 'Delete Position').then(function () {

                Positions.remove(position).then(function (data) {

                    $scope.positions = data;

                    UtilService.showSuccessMessage('#notification-area', 'Position deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record');

                });


            });

        }

    };

    $scope.init();

}]);