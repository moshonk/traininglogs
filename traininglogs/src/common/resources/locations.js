angular.module('resources.locations', ['services.utilities'])

.factory('Locations', ['$filter', '$q', 'TermStoreService', function ($filter, $q, TermStoreService) {

    const LOCATIONS_TERMSET_GUID = '561f2cb0-27c9-4239-955e-c8eac6e7d4e8';

    var Locations = {};

    var locationsList = null;

    Locations.fetchAll = function () {

        var deferred = $q.defer();

        if (locationsList === null) {

            locationsList = [];

            TermStoreService.loadTerms(LOCATIONS_TERMSET_GUID).then(function (termsData) {

                angular.forEach(termsData, function (v, k) {
                    locationsList.push({ id: v.ID, title: v.Name });
                });
                deferred.resolve(locationsList);

            }).catch(function (response) {

                deferred.reject(response);

            });

        } else {

            deferred.resolve(locationsList);

        }

        return deferred.promise;

    };

    Locations.fetchById = function (id) {

        Locations.fetchAll();

        var returnedLocations = $filter('filter')(locationsList, { id: id });

        return returnedLocations[0];

    };

    Locations.addLocation = function (location) {

        var defer = $q.defer();

        if (!location.id) {

            TermStoreService.addTerm(location.title, LOCATIONS_TERMSET_GUID).then(function (response) {

                location.id = response.Id;

                locationsList.push(location);
                console.log(locationsList);
                defer.resolve(location)

            }).catch(function (error) {

                defer.reject(error);

            });

        }

        return defer.promise;

    };

    Locations.remove = function (location) {

        var deferred = $q.defer();

        TermStoreService.removeTerm(LOCATIONS_TERMSET_GUID, location.id).then(function () {

            _.remove(locationsList, { id: location.id });

            deferred.resolve(locationsList);

        }).catch(function (error) {

            deferred.reject(error)

        });

        return deferred.promise;

    };

    Locations.findByTitle = function (title) {

        var deferred = $q.defer();

        title = title.replace('/', '-');

        title = title.replace('&', 'and');

        title = title.replace(/  +/g, ' '); //Replace double spaces with single space

        title = _.trim(_.startCase(_.toLower(title))); //Remove whitespace as well as capitalize first letter of each word

        var location = _.find(locationsList, function (loc) {

            return loc.title.toLowerCase() == title.toLowerCase();

        });

        if (angular.isUndefined(location)) {

            TermStoreService.addTerm(title, LOCATIONS_TERMSET_GUID).then(function (response) {

                location = {};

                location.id = response.Id;

                location.title = response.title;

                locationsList.push(location);

                deferred.resolve(location)

            }).catch(function (error) {

                deferred.reject(error);

            });

        } else {

            deferred.resolve(location);

        }

        return deferred.promise;

    };

    return Locations;

}]);
