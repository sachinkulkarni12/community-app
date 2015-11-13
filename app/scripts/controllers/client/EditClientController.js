(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientController: function (scope, routeParams, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope) {
            scope.offices = [];
            scope.date = {};
            scope.restrictDate = new Date();
            scope.savingproducts = [];
            scope.clientId = routeParams.id;
            scope.showSavingOptions = 'false';
            scope.opensavingsproduct = 'false';
            scope.status = false;
            scope.formDat = {};
            scope.columnHeaders = [];
            resourceFactory.clientResource.get({clientId: routeParams.id, template:'true', staffInSelectedOfficeOnly:true}, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.officeId = data.officeId;
                scope.formData = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    middlename: data.middlename,
                    active: data.active,
                    accountNo: data.accountNo,
                    staffId: data.staffId,
                    externalId: data.externalId,
                    mobileNo: data.mobileNo,
                    savingsProductId: data.savingsProductId,
                    genderId: data.gender.id
                };

                if(data.gender){
                    scope.formData.genderId = data.gender.id;
                }

                if(data.clientType){
                    scope.formData.clientTypeId = data.clientType.id;
                }

                if(data.clientClassification){
                    scope.formData.clientClassificationId = data.clientClassification.id;
                }
                if (data.savingsProductId != null) {
                    scope.opensavingsproduct = 'true';
                    scope.showSavingOptions = 'true';
                } else if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = 'true';
                }

                if (data.dateOfBirth) {
                    var dobDate = dateFilter(data.dateOfBirth, scope.df);
                    scope.date.dateOfBirth = new Date(dobDate);
                }

                var actDate = dateFilter(data.activationDate, scope.df);
                scope.date.activationDate = new Date(actDate);
                if (data.active) {
                    scope.choice = 1;
                    scope.showSavingOptions = 'false';
                    scope.opensavingsproduct = 'false';
                }

                if (data.timeline.submittedOnDate) {
                    var submittedOnDate = dateFilter(data.timeline.submittedOnDate, scope.df);
                    scope.date.submittedOnDate = new Date(submittedOnDate);
                }

            });

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_client'}, function (result) {
                scope.columnHeaders = [];
                scope.columnHeadersResultSet = [];
                for(var i in result){
                    if(result[i].combineWithMainEntity == true){
                        scope.datatablename = result[i].registeredTableName;
                        resourceFactory.DataTablesResource.getTableDetails({datatablename: result[i].registeredTableName,
                            entityId: scope.clientId, genericResultSet: 'true'}, function (data) {
                            if(data.data.length <= 0){
                                scope.datatablename = '';
                            }
                            scope.rowCount = 0;
                            scope.rowCount = data.columnHeaders.length;
                            for(var k=0;k<data.data.length;k++) {
                                scope.tempColumnHeader = angular.copy(data.columnHeaders);
                                for (var z in data.columnHeaders) {
                                    scope.tempColumnHeader[z].showField = false;
                                    if (data.columnHeaders[z].columnCode) {
                                        //logic for display codeValue instead of codeId in view datatable details
                                        for (var j in data.columnHeaders[z].columnValues) {
                                            if (data.columnHeaders[z].columnDisplayType == 'CODELOOKUP') {
                                                if (data.data[k].row[z] == data.columnHeaders[z].columnValues[j].id) {
                                                    scope.tempColumnHeader[z].value = data.columnHeaders[z].columnValues[j].value;
                                                }
                                            } else if (data.columnHeaders[z].columnDisplayType == 'CODEVALUE') {
                                                if (data.data[k].row[z] == data.columnHeaders[z].columnValues[j].value) {
                                                    scope.tempColumnHeader[z].value = data.columnHeaders[z].columnValues[j].value;
                                                }
                                            }
                                        }
                                        scope.tempColumnHeader[z].newColumnName = scope.tempColumnHeader[z].columnName + k;
                                    } else {
                                        scope.tempColumnHeader[z].value = data.data[k].row[z];
                                        scope.tempColumnHeader[z].newColumnName = scope.tempColumnHeader[z].columnName + k;

                                    }
                                }
                                scope.columnHeaders[k] = angular.copy(scope.tempColumnHeader);
                            }
                            scope.prepoluateDatatableEntry();
                        });

                    }
                }
            });

            scope.prepoluateDatatableEntry = function () {
                for(var l in scope.columnHeaders){
                    for(var i=0;i<scope.columnHeaders[l].length;i++){
                        var colName = scope.columnHeaders[l][i].columnName;
                        if (colName == 'id') {
                            scope.columnHeaders[l][i].showField = false;
                        } else if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                            scope.columnHeaders[l][i].showField = false;
                            scope.isCenter = colName == 'center_id' ? true : false;
                        } else {
                            scope.columnHeaders[l][i].showField = true;
                        }
                        if (scope.columnHeaders[l][i].columnDisplayType == 'DATE') {
                            scope.formDat[scope.columnHeaders[l][i].newColumnName] = scope.columnHeaders[l][i].value;
                        } else if (scope.columnHeaders[l][i].columnDisplayType == 'DATETIME') {
                            scope.formDat[scope.columnHeaders[l][i].newColumnName] = {};
                            if(scope.columnHeaders[l][i].value != null) {
                                scope.formDat[scope.columnHeaders[l][i].newColumnName] = {
                                    date: dateFilter(new Date(scope.columnHeaders[l][i].value), scope.df),
                                    time: dateFilter(new Date(scope.columnHeaders[l][i].value), scope.tf)
                                };
                            }
                        } else {
                            scope.formDat[scope.columnHeaders[l][i].newColumnName] = scope.columnHeaders[l][i].value;
                        }
                        if (scope.columnHeaders[l][i].columnCode) {
                            for (var j in scope.columnHeaders[l][i].columnValues) {
                                if (scope.columnHeaders[l][i].value == scope.columnHeaders[l][i].columnValues[j].value) {
                                    if(scope.columnHeaders[l][i].columnDisplayType=='CODELOOKUP'){
                                        scope.formDat[scope.columnHeaders[l][i].newColumnName] = scope.columnHeaders[l][i].columnValues[j].id;
                                        scope.columnValueLookUp = scope.columnHeaders[l][i].columnValues
                                        var obj = angular.fromJson(scope.columnHeaders);
                                        for(var j in scope.columnHeaders[l][i].columnValues){
                                            obj[l][i].columnValuesLookup = scope.columnValueLookUp;
                                        }
                                    } else if(scope.columnHeaders[l][i].columnDisplayType=='CODEVALUE'){
                                        scope.formDat[scope.columnHeaders[l][i].newColumnName] = scope.columnHeaders[l][i].columnValues[j].value;
                                        scope.columnValueLookUp = scope.columnHeaders[l][i].columnValues
                                        var obj = angular.fromJson(scope.columnHeaders);
                                        for(var j in scope.columnHeaders[i].columnValues){
                                            obj[l][i].columnValuesLookup = scope.columnValueLookUp;
                                        }
                                    }
                                }
                            }
                        }

                    }
                }

                if(obj != "" && obj != undefined) {
                    scope.columnHeaders = obj;
                }
            };

            scope.deleteRow = function(index) {
                scope.columnHeaders.splice(index, 1);
            };

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.submit = function () {
                var requests = [];
                var submitProcess = false;
                var requestId = 1;
                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                if (scope.choice === 1) {
                    if (scope.date.activationDate) {
                        this.formData.activationDate = dateFilter(scope.date.activationDate, scope.df);
                    }
                }
                if (routeParams.groupId) {
                    this.formData.groupId = routeParams.groupId;
                }

                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }
                if(scope.date.dateOfBirth){
                    this.formData.dateOfBirth = dateFilter(scope.date.dateOfBirth,  scope.df);
                }

                if(scope.date.submittedOnDate){
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate,  scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
                }

                //Header Requests
                var headers = [{name: "Content-type", value: "application/json"}];

                var updateClientRequest = {};
                updateClientRequest.requestId = requestId;
                updateClientRequest.relativeUrl = "clients/"+routeParams.id+"";
                updateClientRequest.method = "PUT";
                updateClientRequest.headers = headers;
                if(this.formData != null && this.formData != ''){
                    submitProcess = true;
                    var updateClientJsonBody = "{";
                    updateClientJsonBody += "\"firstname\":\"" + this.formData.firstname + "\"";
                    if(this.formData.officeId != null && this.formData.officeId != undefined){
                        updateClientJsonBody += ",\"officeId\":\"" + this.formData.officeId + "\"";
                    }
                    if(this.formData.middlename != undefined && this.formData.middlename != null){
                        updateClientJsonBody += ",\"middlename\":\"" + this.formData.middlename + "\"";
                    }
                    if(this.formData.lastname != null && this.formData.lastname != undefined){
                        updateClientJsonBody += ",\"lastname\":\"" + this.formData.lastname + "\"";
                    }
                    if(this.formData.mobileNo != undefined){
                        updateClientJsonBody += ",\"mobileNo\":\"" + this.formData.mobileNo + "\"";
                    }
                    if(this.formData.dateOfBirth != null && this.formData.dateOfBirth != undefined){
                        updateClientJsonBody += ",\"dateOfBirth\":\"" + this.formData.dateOfBirth + "\"";
                    }
                    if(this.formData.clientTypeId != undefined){
                        updateClientJsonBody += ",\"clientTypeId\":\"" + this.formData.clientTypeId + "\"";
                    }
                    if(this.formData.clientClassificationId != undefined){
                        updateClientJsonBody += ",\"clientClassificationId\":\"" + this.formData.clientClassificationId + "\"";
                    }
                    if(this.formData.genderId != undefined && this.formData.genderId != null){
                        updateClientJsonBody += ",\"genderId\":\"" + this.formData.genderId + "\"";
                    }
                    if(this.formData.externalId != undefined){
                        updateClientJsonBody += ",\"externalId\":\"" + this.formData.externalId + "\"";
                    }
                    if(this.formData.activationDate != null && this.formData.activationDate != undefined){
                        updateClientJsonBody += ",\"activationDate\":\"" + this.formData.activationDate + "\"";
                    }
                    if(this.formData.active != undefined){
                        updateClientJsonBody += ",\"active\":\"" + this.formData.active + "\"";
                    }
                    updateClientJsonBody += ",\"locale\":\"" + this.formData.locale + "\"";
                    updateClientJsonBody += ",\"dateFormat\":\"" + this.formData.dateFormat + "\"";
                    if(this.formData.submittedOnDate != null && this.formData.submittedOnDate != undefined){
                        updateClientJsonBody += ",\"submittedOnDate\":\"" + this.formData.submittedOnDate + "\"";
                    }
                    if(this.formData.savingsProductId != null && this.formData.savingsProductId != undefined){
                        updateClientJsonBody += ",\"savingsProductId\":\"" + this.formData.savingsProductId + "\"";
                    }
                    updateClientJsonBody += "}";
                }

                updateClientRequest.body = updateClientJsonBody;
                requests[0] = updateClientRequest;
                var requestCounter = 1;
                if(this.formDat != null && this.formDat != ''){

                    for(var i = 0; i < scope.columnHeaders.length; i++){
                        var dataTableRequest = {};
                        dataTableRequest.requestId = 2;
                        dataTableRequest.relativeUrl = "";
                        dataTableRequest.method = "PUT";
                        dataTableRequest.headers = headers;
                        var dataTableJsonBody = "{";
                        var firstElement = true;
                        for(var j = 0; j < scope.columnHeaders[i].length; j++){
                            var counter = i*scope.rowCount + j;
                            if(this.formDat[scope.columnHeaders[i][j].columnName] == undefined){
                                this.formDat[scope.columnHeaders[i][j].columnName] = "";
                            }
                            var colName = scope.columnHeaders[i][j].columnName;
                                if(scope.columnHeaders.length <= 1){
                                    if(colName == 'client_id')
                                    dataTableRequest.relativeUrl = "datatables/"+scope.datatablename+"/"+routeParams.id+"?genericResultSet=true";
                                    if(firstElement){
                                        dataTableJsonBody +='"dateFormat": "dd MMMM yyyy",';
                                        dataTableJsonBody +='"locale": "en",';
                                        firstElement = false;
                                    }
                                    if(colName != 'client_id')
                                    dataTableJsonBody += ",";
                                    dataTableJsonBody += "\""+scope.columnHeaders[i][j].columnName+"\":\"" + this.formDat[scope.columnHeaders[i][j].newColumnName] + "\"";
                                }else {
                                    if (colName == 'id')
                                        dataTableRequest.relativeUrl = "datatables/" + scope.datatablename + "/" + routeParams.id + "/" + this.formDat[scope.columnHeaders[i][j].newColumnName] + "?genericResultSet=true";
                                    if (firstElement) {
                                        dataTableJsonBody += '"dateFormat": "dd MMMM yyyy",';
                                        dataTableJsonBody += '"locale": "en"';
                                        firstElement = false;
                                    }else if (colName != 'client_id'){
                                        dataTableJsonBody += ",";
                                        dataTableJsonBody += "\"" + scope.columnHeaders[i][j].columnName + "\":\"" + this.formDat[scope.columnHeaders[i][j].newColumnName] + "\"";
                                    }

                                }
                        }
                        dataTableJsonBody += "}";
                        dataTableRequest.body = dataTableJsonBody;
                        alert(dataTableRequest);
                        requests[requestCounter++] = dataTableRequest;
                    }

                }else{
                    submitProcess = false;
                }
                if(submitProcess){
                    http({
                        method: 'POST',
                        url: $rootScope.hostUrl + API_VERSION + '/batches',
                        dataType: 'json',
                        data: requests
                    }).success(function(data){
                        var response =  angular.fromJson(data[0].body);
                        location.path('/viewclient/' + response.clientId);
                    }).error(function(data){
                        alert("Validation error")
                    });
                }else{
                    alert("Please fill the Details");
                }
        };



}
    });
    mifosX.ng.application.controller('EditClientController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.EditClientController]).run(function ($log) {
        $log.info("EditClientController initialized");
    });
}(mifosX.controllers || {}));
