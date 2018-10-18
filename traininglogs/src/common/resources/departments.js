angular.module('resources.departments', ['services.utilities'])

.factory('Departments', ['$filter', '$q', 'TermStoreService', function ($filter, $q, TermStoreService) {

    const DEPARTMENTS_TERMSET_GUID = '29099b0e-7913-4334-9923-037e136bd3ac';

    var Departments = {};

    var departmentsList = null;

    Departments.fetchAll = function () {

        var deferred = $q.defer();

        if (departmentsList === null) {

            departmentsList = [];

            TermStoreService.loadTerms(DEPARTMENTS_TERMSET_GUID).then(function (termsData) {

                angular.forEach(termsData, function (v, k) {
                    departmentsList.push({ id: v.ID, title: v.Name });
                });

                deferred.resolve(departmentsList);

            }).catch(function (response) {

                deferred.reject(response);

            });

        } else {

            deferred.resolve(departmentsList);

        }

        return deferred.promise;

    };

    Departments.fetchById = function (id) {

        Departments.fetchAll().then(function () {

            var returnedDepartments = $filter('filter')(departmentsList, { id: id });

            $q.defer().resolve(returnedDepartments[0]);

        });

        return $q.defer().promise

    };

    Departments.addDepartment = function (department) {

        var deferred = $q.defer();

        if (!department.id) {

            TermStoreService.addTerm(department.title, DEPARTMENTS_TERMSET_GUID).then(function (response) {

                department.id = response.Id;

                departmentsList.push(department);

                deferred.resolve(department)

            }).catch(function (error) {

                deferred.reject(error);

            });

        }

        return deferred.promise;

    };

    Departments.remove = function (department) {

        var deferred = $q.defer();

        TermStoreService.removeTerm(DEPARTMENTS_TERMSET_GUID, department.id).then(function () {

            _.remove(departmentsList, { id: department.id });

            deferred.resolve(departmentsList);

        }).catch(function (error) {

            deferred.reject(error)

        });

        return deferred.promise;

    };

    Departments.findByTitle = function (title) {

        var deferred = $q.defer();

        title = title.replace('/', '-');

        title = title.replace('&', 'and');

        title = title.replace(/  +/g, ' '); //Replace double spaces with single space

        title = _.trim(_.startCase(_.toLower(title))); //Remove whitespace as well as capitalize first letter of each word

        var department = _.find(departmentsList, function (dept) {

            return dept.title.toLowerCase() == title.toLowerCase();

        });

        if (angular.isUndefined(department)) {

            TermStoreService.addTerm(title, DEPARTMENTS_TERMSET_GUID).then(function (response) {

                department = {};

                department.id = response.Id;

                department.title = response.title;

                departmentsList.push(department);

                deferred.resolve(department)

            }).catch(function (error) {

                deferred.reject(error);

            });

        } else {

            deferred.resolve(department);

        }

        return deferred.promise;

    };

    return Departments;

}]);
