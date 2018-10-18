angular.module('reports', ['resources.trainingreports', 'resources.trainings', 'resources.departments'])

.controller('reportsCtrl', ['$scope', '$log', '$q', 'TrainingReports', 'Trainings', 'Departments', function ($scope, $log, $q, TrainingReports, Trainings, Departments) {

    $scope.init = function () {

        var promises = [];

        promises.push(Trainings.fetchAll());
        promises.push(Departments.fetchAll());
        promises.push(TrainingReports.uniqueYears());

        $q.all(promises).then(function (promiseResults) {

            $scope.trainings = promiseResults[0];
            $scope.departments = promiseResults[1];
            $scope.years = promiseResults[2];
            $scope.reportData = [];

        });

    };

    $scope.attendanceReportGridOptions = {
        enableSorting: false,
        enableFiltering: true,
        columnDefs: [
          { field: 'trainingTitle', enableFiltering: false },
          { field: 'year', enableFiltering: false },
          { field: 'trainingDate', enableFiltering: false },
          { field: 'name', enableFiltering: false },
          { field: 'payrollNo', enableFiltering: false },
          { field: 'gender', enableSorting: false, enableFiltering: false },
          { field: 'position', enableSorting: false, enableFiltering: false },
          { field: 'department', enableSorting: false, enableFiltering: false },
          { field: 'location', enableSorting: false, enableFiltering: false },
          { field: 'attended', enableSorting: false, enableFiltering: true }
        ],
        enableGridMenu: true,
        exporterCsvFilename: 'Training Attendance Report.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "Training Attendance Report", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 14, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'LETTER',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        data: $scope.reportData,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }

    };

    $scope.searchAttendanceRegister = function () {

        var promises = [];

        if ($scope.department) {

            promises.push(TrainingReports.attendanceRegister.fetchByDepartment($scope.year, $scope.training, $scope.department));

        } else {

            promises.push(TrainingReports.attendanceRegister.fetchAll($scope.year, $scope.training));

        }

        $q.all(promises).then(function (promiseResponses) {

            $scope.reportData = promiseResponses[0];

            $scope.attendanceReportGridOptions.data = $scope.reportData;

        });

    };

    $scope.attendanceMatrixGridOptions = {
        enableSorting: false,
        enableFiltering: false,
        columnDefs: $scope.columns,
        enableGridMenu: true,
        exporterCsvFilename: 'Training Log Matrix.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "Training Log Matrix", style: 'headerStyle' },
        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 14, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'LETTER',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        data: $scope.reportData,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.searchAttendanceMatrix = function () {

        var promises = [];

        var reportData, columnDefs;

        if ($scope.department) {
            promises.push(TrainingReports.attendanceLogMatrix.fetch($scope.year, $scope.department));
        } else {
            promises.push(TrainingReports.attendanceLogMatrix.fetch($scope.year));
        }

        $q.all(promises).then(function (promiseResponses) {

            reportData = promiseResponses[0];
            /*
            * //This will convert the input from something like this
            * //["year", "payrollNo", "name", "gender", "position", "department", "location", "Risk Assessment Policy", "traininglogId", "training", "trainingId", "trainingTitle", "personId"];
            * //to something like this
            * //[{field: "year"},{field: "payrollNo"},{field: "name"},{field: "gender"},{field: "position"},{field: "location"},{field: "Risk Assessment Policy"},{field: "traininglogId"},{field: "training"},{field: "trainingId"},{field: "trainingTitle"},{field: "personId"}]
            */
            columnDefs = _.map(reportData.columns, (value, key) => ({ "field": value }));

            $scope.reportData = reportData.data;
            $scope.attendanceMatrixGridOptions.columnDefs = columnDefs;
            $scope.attendanceMatrixGridOptions.data = $scope.reportData;

        });

    };

    $scope.init();

}]);