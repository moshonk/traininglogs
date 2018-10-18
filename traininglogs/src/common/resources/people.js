angular.module('resources.people', ['resources.departments', 'resources.positions', 'resources.locations', 'services.utilities'])

.factory('People', ['$filter', '$log', '$q', '$dialogAlert', 'ShptRestService', 'TermStoreService', 'ArrayUtils', 'Departments', 'Positions', 'Locations', function ($filter, $log, $q, $dialogAlert, ShptRestService, TermStoreService, ArrayUtils, Departments, Positions, Locations) {

    var People = {};

    var peopleList = null;

    const PEOPLE_LIST_NAME = 'People';

    People.fetchAll = function () {

        var deferred = $q.defer();

        if (peopleList === null) {

            peopleList = [];

            var viewXml = '<View><Query></Query></View>';

            ShptRestService.getListItemsWithCaml('People', viewXml).then(function (data) {

                angular.forEach(data.results, function (v, k) {
                    peopleList.push({
                        id: v.ID,
                        payrollNo: v.PayrollNo,
                        name: v.Title,
                        gender: v.Gender,
                        position: { title: v.EmploymentPosition.Label, id: v.EmploymentPosition.TermGuid },
                        department: { title: v.KwtrpDepartment.Label, id: v.KwtrpDepartment.TermGuid },
                        location: { title: v.KWTRPLocation.Label, id: v.KWTRPLocation.TermGuid }
                    }
                    );
                });

                deferred.resolve(peopleList);

            });

        } else {

            deferred.resolve(peopleList);

        }

        return deferred.promise;

    };

    People.fetchById = function (id) {

        var deferred = $q.defer();

        People.fetchAll().then(function () {

            var returnedPeople = _.find(peopleList, { id: id });

            deferred.resolve(returnedPeople);
        });

        return deferred.promise;

    };

    People.fetchByDepartment = function (department) {

        var deferred = $q.defer();

        People.fetchAll().then(function () {

            deferred.resolve(_.filter(peopleList, function (thatPerson) {

                return thatPerson.department.id == department.id;

            }));

        });

        return deferred.promise;
    };

    People.addPerson = function (person) {

        var defer, data;

        defer = $q.defer();

        data = {
            Title: person.name,
            PayrollNo: person.payrollNo,
            Gender: person.gender,
            KWTRPLocation: {
                "TermGuid": person.location.id,
                "WssId": -1
            },
            KwtrpDepartment: {
                "TermGuid": person.department.id,
                "WssId": -1
            },
            EmploymentPosition: {
                "TermGuid": person.position.id,
                "WssId": -1
            }
        }

        var p = People.findByPayrollNo(person.payrollNo);

        if (p && p.id !== person.id) {

            defer.reject('The payroll No ' + person.payrollNo + ' has already been assigned to someone else [' + p.name + '].');

        } else {

            if (!person.id) {

                ShptRestService.createNewListItem(PEOPLE_LIST_NAME, data).then(function (response) {

                    person.id = response.Id;

                    peopleList.push(person);

                    defer.resolve(person)

                }).catch(function (error) {

                    defer.reject(error);

                });

            } else {

                ShptRestService.updateListItem(PEOPLE_LIST_NAME, person.id, data).then(function (response) {

                    //Update PeopleList
                    peopleList = ArrayUtils.updateItemInArray(peopleList, person, { id: person.id });

                    defer.resolve(person)

                }).catch(function (error) {

                    defer.reject(error);

                });

            }

        }

        return defer.promise;

    };

    /*
    *Check if person exists in the people list using payrollNo
    *@param {object} person
    *@returns {bool} true if person found, false if not found
    */
    People.payrollNoExists = function (person) {

        return _.some(peopleList, { payrollNo: person.payrollNo });

    };

    People.remove = function (person) {

        var deferred = $q.defer();

        ShptRestService.deleteListItem(PEOPLE_LIST_NAME, person.id).then(function () {

            _.remove(peopleList, { id: person.id });

            deferred.resolve(peopleList);

        }).catch(function (error) {

            deferred.reject(error)

        });

        return deferred.promise;

    };

    People.findByPayrollNo = function (payrollNo) {

        var index = _.findIndex(peopleList, function (p) {

            return parseInt(p.payrollNo) === parseInt(payrollNo);

        });

        if (index > -1) {

            return peopleList[index];

        } else {

            return false;

        }


    };

    People.import = function (dataObjects) {

        var deferred = $q.defer();

        var personPromises = [];

        angular.forEach(dataObjects, function (k, index) {
            var person, department, location, position;

            var promises = [];

            promises.push(Departments.findByTitle(k.department));
            promises.push(Locations.findByTitle(k.location));
            promises.push(Positions.findByTitle(k.position));

            $q.all(promises).then(function (promiseResponses) {

                department = promiseResponses[0];
                location = promiseResponses[1];
                position = promiseResponses[2];

                if (!People.findByPayrollNo(k.payrollNo)) {

                    var person = {};
                    person.payrollNo = k.payrollNo;
                    person.name = k.name;
                    person.gender = k.gender == 'F' ? 'Female' : 'Male'
                    person.department = department;
                    person.location = location;
                    person.position = position;

                    personPromises.push(People.addPerson(person));

                }

            }, function (error) {

                deferred.reject(error);

            });

        });

        $q.all(personPromises).then(function (promiseResponses) {

            if (promiseResponses.length > 0) {

                angular.forEach(personPromises, function (person, k) {

                    peopleList.add(person);

                });

            }

            deferred.resolve(peopleList);

        }, function (error) {

            deferred.reject(error);

        });

        return deferred.promise;

    };

    /*
    * Get list permissions for current user
    * @returns {promise<object>}  Returns a permissions object 
    */
    People.getListPermissions = function () {

        return ShptRestService.getListUserEffectivePermissions(PEOPLE_LIST_NAME);

    };

    return People;

}]);
