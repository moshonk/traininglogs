angular.module('resources.trainingreports', ['resources.traininglogs', 'resources.attendances', 'resources.people', 'resources.trainings'])

.factory('TrainingReports', ['$filter', '$log', '$q', 'TrainingLogs', 'Attendances', 'People', function ($filter, $log, $q, TrainingLogs, Attendances, People) {

    var TrainingReports = {};

    var reportData = null;

    var trainings = null;

    TrainingReports.reportRecords = {};

    TrainingReports.attendanceRegister = {};

    TrainingReports.attendanceLogMatrix = {};

    /*
    *Get all attendance records (formatted for reporting)
    *@returns {array} Returns a list of all attendance records
    */
    TrainingReports.reportRecords.fetchAll = function () {

        var deferred = $q.defer();

        reportData = [];

        TrainingLogs.fetchAll().then(function (traininglogs) {

            angular.forEach(traininglogs, function (traininglog, k) {

                angular.forEach(traininglog.attendances, function (attendance, k1) {

                    reportRecord = {};
                    reportRecord.personId = attendance.attendee.id;
                    reportRecord.payrollNo = attendance.attendee.payrollNo;
                    reportRecord.name = attendance.attendee.name;
                    reportRecord.gender = attendance.attendee.gender;
                    reportRecord.position = attendance.attendee.position.title;
                    reportRecord.department = attendance.attendee.department.title;
                    reportRecord.location = attendance.attendee.location.title;

                    reportRecord.year = $filter('date')(traininglog.startDate, 'yyyy');
                    reportRecord.trainingDate = $filter('date')(traininglog.startDate, 'dd/MM/yyyy');
                    reportRecord.traininglogId = traininglog.id;
                    reportRecord.training = traininglog.training;
                    reportRecord.trainingId = traininglog.training.id;
                    reportRecord.trainingTitle = traininglog.training.title;

                    reportData.push(reportRecord);

                });

            });

            deferred.resolve(reportData);

        });

        return deferred.promise;

    };

    /*
    *Get attendance records (formatted for reporting) for a selected training
    *@param {integer} year - The year when the training was conducted
    *@param {object} Training - An instance of training
    *@returns {array} Returns a list of staff with their respective attendance status for the selected training
    */
    TrainingReports.reportRecords.fetchByTraining = function (year, training) {

        //TrainingReports.reportRecords.fetchAll();

        return _.filter(reportData, function (reportRecord) {

            return reportRecord.year == year && reportRecord.trainingId == training.id;

        });

    };

    /*
    *Get attendance records (formatted for reporting) for a selected department
    *@param {integer} year - The year when the training was conducted
    *@param {string} Department - 
    *@returns {array} Returns a list of attendance records for the selected department
    */
    TrainingReports.reportRecords.fetchByDepartment = function (year, dept) {

        //TrainingReports.reportRecords.fetchAll();

        return _.filter(reportData, function (reportRecord) {

            return reportRecord.year == year && reportRecord.department == dept;

        });

    };

    /*
    *Get attendance records (formatted for reporting) for a selected department and training
    *@param {integer} year - The year when the training was conducted
    *@param {object} Training - An instance of training
    *@param {string} Department - 
    *@returns {array} Returns a list attendance records for the selected training and department
    */
    TrainingReports.reportRecords.fetchByTrainingAndDepartment = function (year, training, dept) {

        //TrainingReports.reportRecords.fetchAll();

        return _.filter(reportData, function (reportRecord) {

            return (reportRecord.year == year && reportRecord.trainingId == training.id && reportRecord.department == dept);

        });

    };

    /*
    *Get attendance register for a particular training in a particular year
    *@param {integer} year - The year when the trainiig was conducted
    *@param {object} Training - An instance of training
    *@param {string} Department (Optional) - 
    *@returns {array} Returns a list of staff with their respective attendance status for the selected training
    */
    TrainingReports.attendanceRegister.fetch = function (year, training, department) {

        var deferred = $q.defer();

        var attendanceRegisterData = [];

        var people = [];

        var promises = [];

        if (angular.isUndefined(department)) {

            promises.push(People.fetchAll());

        } else {

            promises.push(People.fetchByDepartment(department));

        }

        promises.push(TrainingReports.reportRecords.fetchAll());

        $q.all(promises).then(function (promiseResponses) {

            people = promiseResponses[0];

            reportData = promiseResponses[1];

            angular.forEach(people, function (person, key) {

                var attendanceRecord = {};

                var reportRecord = _.find(reportData, function (item) {

                    return item.personId === person.id && item.year == year && item.training.id == training.id;

                });

                //Set the training attendance status
                if (angular.isUndefined(reportRecord)) {

                    attendanceRecord.attended = "No";

                } else {

                    attendanceRecord.attended = "Yes";

                    _.merge(attendanceRecord, reportRecord);

                }

                attendanceRecord.year = year;

                attendanceRecord.trainingTitle = training.title;

                attendanceRecord.payrollNo = person.payrollNo;

                attendanceRecord.name = person.name;

                attendanceRecord.gender = person.gender;

                attendanceRecord.position = person.position.title;

                attendanceRecord.department = person.department.title;

                attendanceRecord.location = person.location.title;

                //_.merge(attendanceRecord, _.omit(person, ['id'])); //Remove id property form the person object and merge it wih the attendance record object

                attendanceRegisterData.push(attendanceRecord);

            });

            deferred.resolve(attendanceRegisterData);

        });

        return deferred.promise;

    };

    /*
    *Get attendance register for a particular training in a particular year
    *@param {integer} year - The year when the trainiig was conducted
    *@param {object} Training - An instance of training
    *@param {string} Department (Optional) - 
    *@returns {array} Returns a list of staff with their respective attendance status for the selected training
    */
    TrainingReports.attendanceRegister.fetchAll = function (year, training) {

        return TrainingReports.attendanceRegister.fetch(year, training);

    };

    /*
    *Get attendance attendance register for a particular training in a particular year filtered by department
    *@param {integer} year - The year when the trainiig was conducted
    *@param {object} Training - An instance of training
    *@param {string} Department - 
    *@returns {array} Returns a list of staff within a department with their respective attendance status for the selected training
    */
    TrainingReports.attendanceRegister.fetchByDepartment = function (year, training, department) {

        return TrainingReports.attendanceRegister.fetch(year, training, department);

    };

    /*
    *Get a unique list of years in which at least one training was conducted
    *@param {integer} year - The year when the trainings were conducted
    *@returns {array} Returns a list of trainings conducted in the given year
    */
    TrainingReports.uniqueYears = function () {

        var deferred = $q.defer();

        var uniqueYears = [];

        TrainingReports.reportRecords.fetchAll().then(function (allReportRecord) {

            var uniqueRecords = _.uniqBy(allReportRecord, 'year');

            angular.forEach(uniqueRecords, function (value, key) {

                uniqueYears.push(value.year);

            });

            deferred.resolve(uniqueYears);

        });

        return deferred.promise;
    };

    /*
    *Get a unique list of trainings conducted in the selected year
    *@param {integer} year - The year when the trainings were conducted
    *@returns {array} Returns a list of trainings conducted in the given year
    */
    TrainingReports.uniqueTrainings = function (year) {

        var deferred = $q.defer();

        var uniqueTrainings = [];

        TrainingReports.reportRecords.fetchAll().then(function (allReportRecords) {

            var groupedByTraining = _(allReportRecords).filter(function (o) {

                return o.year == year;

            }).groupBy(function (o) {

                return o.trainingId;

            }).value();

            angular.forEach(groupedByTraining, function (value, key) {

                uniqueTrainings.push(value[0].training);

            });

            deferred.resolve(uniqueTrainings);

        });

        return deferred.promise;

    };

    /*
    *Get attendance records (formatted for reporting) for a selected year optionally filtered by department
    *@param {integer} year - The year when the training was conducted
    *@param {string} Department - 
    *@returns {object} An object that contains the the data as an array as well as the list of columns as an object
    */
    TrainingReports.attendanceLogMatrix.fetch = function (year, department) {

        var attendanceLogMatrix = [];

        var deferred = $q.defer();

        var promises = [];

        promises.push(TrainingReports.uniqueTrainings(year));

        promises.push(TrainingReports.reportRecords.fetchAll());

        if (angular.isUndefined(department)) {

            promises.push(People.fetchAll());

        } else {

            promises.push(People.fetchByDepartment(department));

        }

        $q.all(promises).then(function (promiseResults) {

            var trainings, people, reportRecords;
            var columns = {}; //This variable will be used to fetch all the column values from the resultant array of report records

            trainings = promiseResults[0];

            reportRecords = promiseResults[1];

            people = promiseResults[2];

            angular.forEach(people, function (person, key) {

                var attendanceRecord = {};

                attendanceRecord.year = year;

                attendanceRecord.payrollNo = person.payrollNo;

                attendanceRecord.name = person.name;

                attendanceRecord.gender = person.gender;

                attendanceRecord.position = person.position.title;

                attendanceRecord.department = person.department.title;

                attendanceRecord.location = person.location.title;

                //_.merge(attendanceRecord, _.omit(person, ['id'])); //Remove id property form the person object and merge it with the attendance record object

                angular.forEach(trainings, function (value, key) {

                    var training = value;

                    var reportRecord = _.find(reportData, function (item) {

                        return item.personId === person.id && item.year == year && item.trainingId == training.id;

                    });

                    if (angular.isUndefined(reportRecord)) { //Set the training attendance status

                        attendanceRecord[training.title] = "Not attended";

                    } else {

                        attendanceRecord[training.title] = "Attended";

                    }

                    /*
                    * Get the keys from the 'attendanceRecord' array and merge them into a single array
                    * This will ensure that all column titles represented in the dataset are captured.
                    */
                    columns = _.merge(_.keys(attendanceRecord));

                });

                attendanceLogMatrix.push(attendanceRecord);

            });

            deferred.resolve({ data: attendanceLogMatrix, columns: columns });

        });

        return deferred.promise;

    };

    return TrainingReports;

}]);
