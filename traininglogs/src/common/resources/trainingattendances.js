angular.module('resources.attendances', ['resources.people', 'services.utilities'])

.factory('Attendances', ['$filter', '$q', 'ArrayUtils', 'ShptRestService', 'People', function ($filter, $q, ArrayUtils, ShptRestService, People) {

    var Attendances = {};

    var AttendanceList = null;

    const ATTENDANCES_LIST_NAME = 'Trainingattendances';

    /*
    *Get all training attendances
    *@returns {array} person - Array of training attendances
    */
    Attendances.fetchAll = function () {

        var deferred = $q.defer();

        if (AttendanceList === null) {

            AttendanceList = [];

            var queryParams = '$select=ID,TraininglogId,AttendeeId';

            var promises = [];

            promises.push(ShptRestService.getListItems(ATTENDANCES_LIST_NAME, queryParams));

            promises.push(People.fetchAll());

            $q.all(promises).then(function (promiseResults) {

                var trainingAttendances, people;

                trainingAttendances = promiseResults[0].results;

                people = promiseResults[1];

                angular.forEach(trainingAttendances, function (v, k) {

                    var attendance = {};

                    attendance.id = v.ID;
                    attendance.remarks = angular.isUndefined(v.Remarks) ? '' : v.Remarks;
                    attendance.traininglogId = v.TraininglogId
                    attendance.attendee = _.find(people, { id: v.AttendeeId });
                    AttendanceList.push(attendance);

                });

                deferred.resolve(AttendanceList);

            });

        } else {

            deferred.resolve(AttendanceList);
        }

        return deferred.promise;

    };

    /*
    *Get attendance by transaction id
    *@param {integer} id - Training Attendee Id
    *@returns {object} TrainingAttendance - A training attendance
    */
    Attendances.fetchById = function (id) {

        var deferred = $q.defer();

        Attendances.fetchAll().then(function () {

            var returnedAttendances = _.find(AttendanceList, { id: id });

            deferred.resolve(returnedAttendance);

        });

        return deferred.promise;

    };

    /*
    *Get attendances filtered by Training Log Id
    *@param {integer} id - Training Log Id
    *@returns {array} person - A training attendance
    */
    Attendances.fetchByTraininglogId = function (id) {

        Attendances.fetchAll();

        var returnedAttendances = $filter('filter')(AttendanceList, { traininglogId: id });

        return returnedAttendances;

    };

    /*
    *Get attendances filtered by Training Id
    *@param {integer} id - The Training Id
    *@returns {object} trainingattendance - A training attendance
    */
    Attendances.fetchByTrainingId = function (id) {

        Attendances.fetchAll();

        var returnedAttendances = $filter('filter')(AttendanceList, { trainingId: id });

        return returnedAttendance[0];

    };

    /*
    *Get attendances filtered by a provided criteria
    *@param {object} filterCriteria - The filter criteria
    *@returns {array} trainingattendance - array of Training attendances
    */
    Attendances.fetch = function (filterCriteria) {

        if (angular.isObject(filterCriteria)) {

            Attendances.fetchAll();

            var returnedAttendances = $filter('filter')(AttendanceList, filterCriteria);

            return returnedAttendances;

        }

    };

    Attendances.addAttendee = function (traininglog) {

        var defer, data;

        defer = $q.defer();

        data = {
            Title: traininglog.training.title + '(' + traininglog.startDate + ') - ' + traininglog.attendance.attendee.name,
            TraininglogId: traininglog.id,
            AttendeeId: traininglog.attendance.attendee.id
        }

        ShptRestService.createNewListItem('Trainingattendances', data).then(function (response) {

            traininglog.attendance.id = response.Id;

            AttendanceList.push(traininglog.attendance);

            defer.resolve(traininglog.attendance)

        }).catch(function (error) {

            defer.reject(error);

        });

        return defer.promise;

    };

    Attendances.updateAttendee = function (traininglog) {

        ArrayUtils.updateByAttr(AttendanceList, 'id', traininglog.attendance.id, traininglog.attendance);

        //TODO Persist to DB

    };

    /*
    * Remove an attendee from a training session
    * @param {object} traininglog instance
    * @param {object} person to be removed from the training log instance
    * @returns {object} traininglog instance
    */
    Attendances.removeAttendee = function (traininglog, attendance) {

        var deferred = $q.defer();

        ShptRestService.deleteListItem('Trainingattendances', attendance.id).then(function (response) {

            var matchingAttendance = _.find(traininglog.attendances, function (thatAttendance) {

                return thatAttendance.id == attendance.id;

            });

            traininglog.attendances = _.without(traininglog.attendances, matchingAttendance);

            deferred.resolve(traininglog);

        }).catch(function (error) {

            deferred.reject(error)

        });

        return deferred.promise;

    };

    /*
    * Get list permissions for current user
    * @returns {promise<object>}  Returns a permissions object wrapped inside a promise
    */
    Attendances.getListPermissions = function () {

        return ShptRestService.getListUserEffectivePermissions(ATTENDANCES_LIST_NAME);

    };

    return Attendances;

}]);
