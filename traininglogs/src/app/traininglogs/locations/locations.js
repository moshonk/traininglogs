angular.module('locations', ['ui.bootstrap.dialogs', 'resources.locations'])

.controller('locationCtrl', ['$scope', '$log', '$routeParams', '$location', '$dialog', '$dialogConfirm', '$dialogAlert', 'UtilService', 'Locations', function ($scope, $log, $routeParams, $location, $dialog, $dialogConfirm, $dialogAlert, UtilService, Locations) {

    $scope.init = function () {

        Locations.fetchAll().then(function (locations) {

            $scope.locations = locations;

        });

        $scope.links = UtilService.getAppShortcutlinks();

    };

    var locationId = $routeParams.id;

    if (!angular.isUndefined(locationId)) { //View existing location 

        locationId = parseInt($routeParams.id);

        $scope.location = Locations.fetchById(locationId);

    }

    $scope.addLocation = function () {

        $scope.location = {};

        $dialog('app/traininglogs/locations/location-add.tpl.html', 'lg').then(function (location) {

            $location.path("/listLocations/");

        });

    };

    $scope.editLocation = function (location) {
        
        var locationDataWrapper = { scopeVariableName: 'location', dataObject: location };

        $dialog('app/traininglogs/locations/location-add.tpl.html', 'lg', locationDataWrapper).then(function (location) {

            $location.path("/listLocations/");

        });

    };

    this.updateLocation = function (location) {

        Locations.addLocation(location).then(function (location) {

            UtilService.showSuccessMessage('#notification-area', 'Location updated successfully!!');

        }).catch(function (error) {

            $dialogAlert(error, 'Unable to update location');

        });

    };

    $scope.deleteLocation = function (location) {

        if (location) {

            $dialogConfirm('Are you sure you want to delete this record (' + location.title + ' )', 'Delete Location').then(function () {

                Locations.remove(location).then(function (data) {

                    $scope.locations = data;

                });

            });

        }

    };

    $scope.deleteLocation = function (location) {

        if (location) {

            $dialogConfirm('Are you sure you want to delete this record (' + location.title + ' )', 'Delete Location').then(function () {

                Locations.remove(location).then(function (data) {

                    $scope.locations = data;

                    UtilService.showSuccessMessage('#notification-area', 'Location deleted successfully!!');

                }).catch(function (error) {

                    $dialogAlert(error, 'Unable to delete record');

                });


            });

        }

    };

    $scope.init();

}]);