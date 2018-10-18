angular.module('resources.trainings', ['services.utilities', 'resources.departments'])

.factory('Trainings', ['$filter', '$log', '$q', 'TermStoreService', function ($filter, $log, $q, TermStoreService) {

    var Trainings = {};

    var trainingsList = null;

    const TRAININGS_TERMSET_GUID = '64bc860c-3d44-4978-933a-d9d0fe24b885';

    Trainings.fetchAll = function () {

        var deferred = $q.defer();

        if (trainingsList === null) {

            trainingsList = [];

            TermStoreService.loadTerms(TRAININGS_TERMSET_GUID).then(function (termsData) {

                angular.forEach(termsData, function (v, k) {
                    trainingsList.push({ id: v.ID, title: v.Name });
                });

                deferred.resolve(trainingsList);

            }).catch(function (response) {

                deferred.reject(response);

            });

        } else {

            deferred.resolve(trainingsList);
        }

        return deferred.promise;

    };

    Trainings.fetchById = function (id) {
        var deferred = $q.defer();

        Trainings.fetchAll().then(function () {

            var returnedTraining = _.find(trainingsList, { id: id });

            deferred.resolve(returnedTraining);

        });

        return deferred.promise;

    };

    Trainings.addTraining = function (training) {

        var defer = $q.defer();

        if (!training.id) {

            TermStoreService.addTerm(training.title, TRAININGS_TERMSET_GUID).then(function (response) {

                training.id = response.Id;

                trainingsList.push(training);

                defer.resolve(training)

            }).catch(function (error) {

                defer.reject(error);

            });

        }

        return defer.promise;

    };

    Trainings.remove = function (training) {

        var deferred = $q.defer();

        TermStoreService.removeTerm(TRAININGS_TERMSET_GUID, training.id).then(function () {

            _.remove(trainingsList, { id: training.id });

            deferred.resolve(trainingsList);

        }).catch(function (error) {

            deferred.reject(error)

        });

        return deferred.promise;

    };

    return Trainings;

}])
