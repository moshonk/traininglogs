<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <!--    SharePoint page developers can opt-out of clickjacking protection by adding the AllowFraming control to their .aspx pages:
    <WebPartPages:AllowFraming runat="server" />
    https://blogs.msdn.microsoft.com/officeapps/2012/12/12/iframing-sharepoint-hosted-pages-in-apps/
    -->
    <WebPartPages:AllowFraming runat="server" />

    <SharePoint:ScriptLink Name="sp.runtime.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.requestexecutor.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.taxonomy.js"></script>

    <meta name="WebPartPageExpansion" content="full" />
    <!-- Add your CSS styles to the following file -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />
    <link rel="stylesheet" href="http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
    <link rel="stylesheet" href="http://ui-grid.info/release/ui-grid.css" />
    <link rel="stylesheet" href="css/angucomplete-alt.css" />
    <link rel="stylesheet" href="common/directives/mfb/mfb.min.css" />
    <link rel="stylesheet" href="common/directives/am.multiselect/multiselect.css" />
    <link href="common/directives/peoplepicker/sp-peoplepicker.min.css" rel="stylesheet" />
    <link href="//cdnjs.cloudflare.com/ajax/libs/angular-loading-bar/0.9.0/loading-bar.min.css" rel="stylesheet" />

    <link rel="stylesheet" href="css/style.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <script type="text/javascript" src="https://code.angularjs.org/1.4.12/angular.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-route.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.2/angular-animate.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js"></script>
    <script type="text/javascript" src="http://ui-grid.info/release/ui-grid.js"></script>
    <script type="text/javascript" src="http://ui-grid.info/docs/grunt-scripts/csv.js"></script>
    <script type="text/javascript" src="http://ui-grid.info/docs/grunt-scripts/pdfmake.js"></script>
    <script type="text/javascript" src="http://ui-grid.info/docs/grunt-scripts/vfs_fonts.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.5.0/ui-bootstrap-tpls.min.js"></script>
    <script type="text/javascript" charset="utf-8" src="https://ghiden.github.io/angucomplete-alt/js/libs/angucomplete-alt.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery.SPServices/2014.02/jquery.SPServices.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-loading-bar/0.9.0/loading-bar.min.js"></script>

    <script type="text/javascript" src="../vendor/angular-ui/bootstrap/ui-bootstrap-dialogs.js"></script>

    <script type="text/javascript" src="common/directives/am.multiselect/am.multiselect.js"></script> <!-- Source: https://github.com/amitava82/angular-multiselect -->
    <script type="text/javascript" src="common/directives/mfb/mfb-directive.js"></script><!-- Source https://github.com/nobitagit/ng-material-floating-button -->
    <script type="text/javascript" src="common/directives/pagination/dirPagination.js"></script> <!-- Source https://github.com/michaelbromley/angularUtils/tree/master/src/directives/pagination -->
    <script type="text/javascript" src="common/directives/peoplepicker/sp-peoplepicker.js"></script> <!-- Source https://github.com/jasonvenema/sharepoint-angular-peoplepicker -->
    <script type="text/javascript" src="common/directives/angular-js-xlsx/xlsx.core.min.js"></script> <!-- Source https://github.com/SheetJS/js-xlsx -->
    <script type="text/javascript" src="common/directives/angular-js-xlsx/angular-js-xlsx.js"></script> <!-- Source https://github.com/brexis/angular-js-xlsx -->

    <script type="text/javascript" src="common/services/utililities.js"></script>
    <!-- Models -->
    <script type="text/javascript" src="common/resources/positions.js"></script>
    <script type="text/javascript" src="common/resources/locations.js"></script>
    <script type="text/javascript" src="common/resources/departments.js"></script>
    <script type="text/javascript" src="common/resources/people.js"></script>
    <script type="text/javascript" src="common/resources/trainings.js"></script>
    <script type="text/javascript" src="common/resources/traininglogs.js"></script>
    <script type="text/javascript" src="common/resources/trainingattendances.js"></script>
    <script type="text/javascript" src="common/resources/trainingreports.js"></script>
    <!-- Controllers -->
    <script type="text/javascript" src="app/traininglogs/people/people.js"></script>
    <script type="text/javascript" src="app/traininglogs/trainings/trainings.js"></script>
    <script type="text/javascript" src="app/traininglogs/departments/departments.js"></script>
    <script type="text/javascript" src="app/traininglogs/positions/positions.js"></script>
    <script type="text/javascript" src="app/traininglogs/locations/locations.js"></script>
    <script type="text/javascript" src="app/traininglogs/logs/traininglogs.js"></script>
    <script type="text/javascript" src="app/traininglogs/reports/reports.js"></script>

    <script type="text/javascript" src="app/app.js"></script>

</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <!-- Trainings Logs Application-->
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div class="container-fluid" data-ng-app="app">
        <!--       <h1>Trainings Log Application</h1>-->
        <div id="notification-area">
        </div>
        <%--<div ng-include src="'app/traininglogs/people/people-importer.tpl.html'"></div>--%>
        <div data-ng-view=""></div>
        <div ng-include src="'app/mfb-buttons.tpl.html'"></div>
    </div>

</asp:Content>
