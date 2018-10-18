angular.module('resources.traininglogs', ['resources.trainings', 'resources.attendances', 'services.utilities'])

.factory('TrainingLogs', ['$filter', '$q', 'ArrayUtils', 'Trainings', 'Attendances', 'ShptRestService',
    function ($filter, $q, ArrayUtils, Trainings, Attendances, ShptRestService) {

        var TrainingLogs = {};

        var logs = null;

        var trainings = null;

        const TRAINING_LOGS_LIST_NAME = 'Trainingslog';

        var getLog = function (selectedLog) {

            var returnedLogs = $filter('filter')(logs, { id: selectedLog.id });

            return returnedLogs[0];

        };

        TrainingLogs.fetchAll = function () {

            var deferred = $q.defer();

            if (logs === null) {

                logs = [];

                Attendances.fetchAll().then(function (attendances) {

                    var facilitatorPromises = [];

                    var viewXml = '<View><Query></Query></View>';
                    ShptRestService.getListItemsWithCaml(TRAINING_LOGS_LIST_NAME, viewXml).then(function (data) { //Using caml to so that we can expand the Taxonomy field, TargetDepartment

                        angular.forEach(data.results, function (v, k) {
                            var traininglog = {};
                            traininglog.id = v.ID;
                            traininglog.startDate = new Date(v.StartDate);
                            traininglog.target = v.Target;
                            if (traininglog.target == "selected") {
                                traininglog.targetDepartment = [];
                                if (v.TargetDepartment1) {
                                    angular.forEach(v.TargetDepartment1.results, function (department, k) {
                                        traininglog.targetDepartment.push({ title: department.Label, id: department.TermGuid });
                                    });
                                }
                            }
                            traininglog.training = { title: v.TrainingTitle.Label, id: v.TrainingTitle.TermGuid };
                            traininglog.attendances = _.filter(attendances, { traininglogId: v.ID });

                            //Get the facilitator(s)
                            //Here we make use of oData to fetch user details(Name, Title, Email)
                            var queryParams = '$select=Facilitator/ID,Facilitator/Title,Facilitator/Name,Facilitator/EMail&$expand=Facilitator&$filter=ID eq ' + traininglog.id;
                            facilitatorPromises.push(ShptRestService.getListItems(TRAINING_LOGS_LIST_NAME, queryParams));

                            logs.push(traininglog);

                        });

                        $q.all(facilitatorPromises).then(function (facilitatorPromiseResponses) {

                            for (var i = 0; i < facilitatorPromiseResponses.length; i++) {

                                var data = facilitatorPromiseResponses[i];

                                logs[i].facilitator = [];

                                if (data.results.length > 0) {

                                    angular.forEach(data.results[0].Facilitator.results, function (facilitator, key) {

                                        logs[i].facilitator.push({
                                            Login: facilitator.Name,
                                            Name: facilitator.Title,
                                            Email: facilitator.EMail,
                                            Id: facilitator.ID
                                        });

                                    });

                                }

                            }

                            deferred.resolve(logs);

                        });

                    });

                });

            } else {

                deferred.resolve(logs);

            }

            return deferred.promise;

        }

        TrainingLogs.fetchById = function (id) {

            var deferred = $q.defer();

            TrainingLogs.fetchAll().then(function (logs) {
                id = parseInt(id);
                var returnedTraininglog = _.find(logs, { "id": id });

                deferred.resolve(returnedTraininglog);

            });

            return deferred.promise;

        };

        TrainingLogs.addLog = function (traininglog) {

            var deferred = $q.defer();

            var promises = [];

            //Ensure that all selected users have been added to the site 
            angular.forEach(traininglog.facilitator, function (facilitator, k) {

                promises.push(ShptRestService.ensureUser(facilitator.Login));

            });

            $q.all(promises).then(function (promiseResults) {

                var facilitatorIds, targetDepartments, promises;
                var data = {};

                facilitatorIds = [];
                for (var i = 0; i < traininglog.facilitator.length; i++) {
                    var user = promiseResults[i];
                    traininglog.facilitator[i].id = user.id;
                    facilitatorIds.push(user.Id);
                }

                data = {
                    Title: traininglog.training.title + ' Training',
                    StartDate: traininglog.startDate,
                    Target: traininglog.target,
                    FacilitatorId: { results: facilitatorIds },
                    TrainingTitle: {
                        "TermGuid": traininglog.training.id,
                        "WssId": -1
                    }
                };

                if (traininglog.target == 'selected') {
                    /*
                    * Update the target departments (Multi value taxonomy field)
                    */
                    targetDepartments = "";
                    for (var i = 0; i < traininglog.targetDepartment.length; i++) {

                        targetDepartments += '-1;#' + traininglog.targetDepartment[i].title +
                                            "|" + traininglog.targetDepartment[i].id + ';#';

                    }

                    ShptRestService.getMultiValueTaxonomyHiddenNoteFieldName(TRAINING_LOGS_LIST_NAME, 'TargetDepartment1').then(function (hiddenNoteFieldName) {

                        data[hiddenNoteFieldName] = targetDepartments;

                        TrainingLogs.saveLogToDatabase(traininglog, data).then(function (response) {

                            deferred.resolve(response);

                        }).catch(function (error) {

                            deferred.reject(error);

                        });

                    }).catch(function (error) {

                        deferred.reject(error);

                    });

                } else {

                    traininglog.targetDepartment = [];

                    TrainingLogs.saveLogToDatabase(traininglog, data).then(function (response) {

                        deferred.resolve(response);

                    }).catch(function (error) {

                        deferred.reject(error);

                    });

                }

            });

            return deferred.promise;

        };

        TrainingLogs.saveLogToDatabase = function (traininglog, data) {

            var deferred = $q.defer();

            if (angular.isUndefined(traininglog.id)) {

                ShptRestService.createNewListItem(TRAINING_LOGS_LIST_NAME, data).then(function (response) {

                    traininglog.id = response.ID;

                    traininglog.attendances = [];

                    logs.push(traininglog);

                    deferred.resolve(traininglog);

                }).catch(function (error) {

                    deferred.reject(error);

                });

            } else {

                ShptRestService.updateListItem(TRAINING_LOGS_LIST_NAME, traininglog.id, data).then(function (response) {

                    //Update Training logs list
                    logs = ArrayUtils.updateItemInArray(logs, traininglog, { id: traininglog.id });

                    deferred.resolve(traininglog);

                }).catch(function (error) {

                    deferred.reject(error);

                });

            }

            return deferred.promise;

        };

        TrainingLogs.updateLog = function (traininglog) {

            ArrayUtils.updateByAttr(AttendanceList, 'id', traininglog.id, traininglog);

            //TODO persist to db;

        };

        TrainingLogs.remove = function (traininglog) {

            var deferred = $q.defer();

            ShptRestService.deleteListItem(TRAINING_LOGS_LIST_NAME, traininglog.id).then(function () {

                logs = _.remove(logs, { id: traininglog.id });

                deferred.resolve(logs);

            }).catch(function (error) {

                deferred.reject(error)

            });

            return deferred.promise;

        };

        TrainingLogs.addAttendee = function (selectedTraininglog) {

            var deferred = $q.defer();

            Attendances.addAttendee(selectedTraininglog).then(function (attendance) {

                deferred.resolve(attendance);

            }).catch(function (error) {

                deferred.reject(error);

            });

            return deferred.promise;

        };

        TrainingLogs.updateAttendee = function (selectedTraininglog) {

            Attendances.updateAttendee(selectedTraininglog);

        };

        TrainingLogs.removeAttendee = function (selectedTraininglog, attendance) {

            return Attendances.removeAttendee(selectedTraininglog, attendance);

        };

        /*
        *Check if person is in the attendance list for a training
        *@param {object} traininglog - Training Log (Contains attendance list)
        *@param {object} person - Person to search for in attendance list
        *@returns {bool} True if person has been registred for training , Faklse if not
        */
        TrainingLogs.isPersonInAttendanceList = function (traininglog, person) {

            var attendanceList = traininglog.attendances;

            var found = _.some(attendanceList, function (attendance) {

                return attendance.attendee.id == person.id;

            });

            return found;

        };

        /*
        * Get list permissions for current user
        * @returns {promise<object>}  Returns a permissions object wrapped inside a promise
        */
        TrainingLogs.getListPermissions = function () {

            return ShptRestService.getListUserEffectivePermissions(TRAINING_LOGS_LIST_NAME);

        };

        return TrainingLogs;

    }]);
