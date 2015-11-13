(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateClientController: function (scope, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope, routeParams, route) {
            scope.offices = [];
            scope.staffs = [];
            scope.savingproducts = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.first.submitondate = new Date ();
            scope.formData = {};
            scope.formDat = {};
            scope.restrictDate = new Date();
            scope.showSavingOptions = false;
            scope.opensavingsproduct = false;
            scope.forceOffice = null;
            scope.columnHeaders = [];
            scope.counter = 1;
            scope.columnHeaderDataNew = [];

            var requestParams = {staffInSelectedOfficeOnly:true};
            if (routeParams.groupId) {
                requestParams.groupId = routeParams.groupId;
            }
            if (routeParams.officeId) {
                requestParams.officeId = routeParams.officeId;
            }
            resourceFactory.clientTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.formData.officeId = scope.offices[0].id;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = true;
                }
                if(routeParams.officeId) {
                    scope.formData.officeId = routeParams.officeId;
                    for(var i in data.officeOptions) {
                        if(data.officeOptions[i].id == routeParams.officeId) {
                            scope.forceOffice = data.officeOptions[i];
                            break;
                        }
                    }
                }
                if(routeParams.groupId) {
                    if(typeof data.staffId !== "undefined") {
                        scope.formData.staffId = data.staffId;
                    }
                }
            });

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_client'}, function (data) {
                scope.columnHeaders = [];
                for(var i in data){
                    if(data[i].combineWithMainEntity == true){
                        scope.registerDataTableName = data[i].registeredTableName;
                        for(var j in data[i].columnHeaderData){
                            if(data[i].columnHeaderData[j].columnName == 'id'){
                                data[i].columnHeaderData.splice(0, 1);
                            }
                            if(data[i].columnHeaderData[j].columnName == 'client_id'){
                                data[i].columnHeaderData.splice(0, 1);
                            }
                            data[i].columnHeaderData[j].columnNameNew = data[i].columnHeaderData[j].columnName + scope.counter;

                        }
                        scope.counter++;
                        scope.columnHeaders.push(data[i]);
                        scope.columnHeaderDataNew = angular.copy(data[i]);
                        if(data[i].minimumNoOfRows > 1){
                            for(var k=1;k<data[i].minimumNoOfRows;k++){
                                scope.addRow();
                            }
                        }
                    }
                }
            });

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

            scope.addRow = function(){
                for(var j in scope.columnHeaderDataNew.columnHeaderData) {
                    scope.columnHeaderDataNew.columnHeaderData[j].columnNameNew = scope.columnHeaderDataNew.columnHeaderData[j].columnName + scope.counter;
                }
                scope.counter++;
                var addRowColumnHeaderData = angular.copy(scope.columnHeaderDataNew);
                scope.columnHeaders.push(addRowColumnHeaderData);

            };

            scope.deleteRow = function(index) {
                scope.columnHeaders.splice(index, 1);
            };

            scope.changeOffice = function (officeId) {
                resourceFactory.clientTemplateResource.get({staffInSelectedOfficeOnly:true, officeId: officeId
                }, function (data) {
                    scope.staffs = data.staffOptions;
                    scope.savingproducts = data.savingProductOptions;
                });
            };

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };
            if(routeParams.groupId) {
            	scope.cancel = '#/viewgroup/' + routeParams.groupId
            	scope.groupid = routeParams.groupId;
            }else {
            	scope.cancel = "#/clients"
            }

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                this.formData.activationDate = reqDate;

                if (routeParams.groupId) {
                    this.formData.groupId = routeParams.groupId;
                }

                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }

                if (scope.first.submitondate) {
                    reqDate = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDate;
                }

                if (scope.first.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
                }

                resourceFactory.clientResource.save(this.formData, function (data) {
                    location.path('/viewclient/' + data.clientId);
                });
            };

            scope.submitBatch = function(){
                var requests = [];
                var submitProcess = false;
                var requestId = 1;
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.dateFormat = scope.df;
                this.formData.activationDate = reqDate;

                if (routeParams.groupId) {
                    this.formData.groupId = routeParams.groupId;
                }

                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }

                if (scope.first.submitondate) {
                    reqDate = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDate;
                }

                if (scope.first.dateOfBirth) {
                    this.formData.dateOfBirth = dateFilter(scope.first.dateOfBirth, scope.df);
                }

                if (!scope.opensavingsproduct) {
                    this.formData.savingsProductId = null;
                }

                //Header Requests
                var headers = [{name: "Content-type", value: "application/json"}];

                var createClientRequest = {};
                createClientRequest.requestId = requestId;
                createClientRequest.relativeUrl = "clients";
                createClientRequest.method = "POST";
                createClientRequest.headers = headers;
                if(this.formData != null){
                    submitProcess = true;
                    var createClientJsonBody = "{";
                    createClientJsonBody += "\"officeId\":\"" + this.formData.officeId + "\"";
                    createClientJsonBody += ",\"firstname\":\"" + this.formData.firstname + "\"";
                    if(this.formData.middlename != undefined && this.formData.middlename != null){
                        createClientJsonBody += ",\"middlename\":\"" + this.formData.middlename + "\"";
                    }
                    if(this.formData.lastname != undefined){
                        createClientJsonBody += ",\"lastname\":\"" + this.formData.lastname + "\"";
                    }
                    if(this.formData.mobileNo != undefined){
                        createClientJsonBody += ",\"mobileNo\":\"" + this.formData.mobileNo + "\"";
                    }
                    if(this.formData.dateOfBirth != undefined){
                        createClientJsonBody += ",\"dateOfBirth\":\"" + this.formData.dateOfBirth + "\"";
                    }
                    if(this.formData.clientTypeId != undefined){
                        createClientJsonBody += ",\"clientTypeId\":\"" + this.formData.clientTypeId + "\"";
                    }
                    if(this.formData.clientClassificationId != undefined){
                        createClientJsonBody += ",\"clientClassificationId\":\"" + this.formData.clientClassificationId + "\"";
                    }
                    if(this.formData.genderId != undefined && this.formData.genderId != null){
                        createClientJsonBody += ",\"genderId\":\"" + this.formData.genderId + "\"";
                    }
                    if(this.formData.active != null && this.formData.active != undefined){
                        createClientJsonBody += ",\"active\":\"" + this.formData.active + "\"";
                    }
                    createClientJsonBody += ",\"locale\":\"" + this.formData.locale + "\"";
                    createClientJsonBody += ",\"dateFormat\":\"" + this.formData.dateFormat + "\"";
                    if(this.formData.externalId != undefined){
                        createClientJsonBody += ",\"externalId\":\"" + this.formData.externalId + "\"";
                    }
                    if(this.formData.activationDate != undefined){
                        createClientJsonBody += ",\"activationDate\":\"" + this.formData.activationDate + "\"";
                    }
                    if(this.formData.submittedOnDate != undefined){
                        createClientJsonBody += ",\"submittedOnDate\":\"" + this.formData.submittedOnDate + "\"";
                    }
                    if(this.formData.savingsProductId != null && this.formData.savingsProductId != undefined){
                        createClientJsonBody += ",\"savingsProductId\":\"" + this.formData.savingsProductId + "\"";
                    }
                    createClientJsonBody += "}";
                    createClientRequest.body = createClientJsonBody;
                }
                requests[0] = createClientRequest;

                if(this.formDat != null && this.formDat != '' && this.formDat != undefined){
                    var dataTableRequest = {};
                    dataTableRequest.requestId = 2;
                    dataTableRequest.method = "POST";
                    dataTableRequest.headers = headers;
                    dataTableRequest.reference = 1;
                    var dataTableJsonBody = "[";
                    for(var m=0; m<scope.columnHeaders.length; m++) {
                        dataTableRequest.relativeUrl = "datatables/"+scope.columnHeaders[m].registeredTableName+"/$.clientId?genericResultSet=true";
                        if(m == 0){
                            dataTableJsonBody += "{";
                        }else{
                            dataTableJsonBody += ",{";
                        }
                        for (var n = 0; n < scope.columnHeaders[m].columnHeaderData.length; n++) {
                            if(this.formDat[scope.columnHeaders[m].columnHeaderData[n].columnName] == undefined){
                                this.formDat[scope.columnHeaders[m].columnHeaderData[n].columnName] = "";
                            }
                            if(n == 0){
                                dataTableJsonBody += "\""+scope.columnHeaders[m].columnHeaderData[n].columnName+"\":\"" + this.formDat[scope.columnHeaders[m].columnHeaderData[n].columnNameNew] + "\"";
                            }else{
                                dataTableJsonBody += ",\""+scope.columnHeaders[m].columnHeaderData[n].columnName+"\":\"" + this.formDat[scope.columnHeaders[m].columnHeaderData[n].columnNameNew] + "\"";
                            }
                        }
                        dataTableJsonBody += "}";
                    }
                    dataTableJsonBody += "]";
                }else{
                    submitProcess = false;
                }
                dataTableRequest.body = dataTableJsonBody;
                requests[1] = dataTableRequest;

                if(submitProcess){
                    http({
                        method: 'POST',
                        url: $rootScope.hostUrl + API_VERSION + '/batches?enclosingTransaction=true',
                        dataType: 'json',
                        data: requests
                    }).success(function(data){
                        var response =  angular.fromJson(data[0].body);
                        location.path('/viewclient/' + response.clientId);
                    }).error(function(data){
                        alert("Validation error ")
                    });
                }else{
                    alert("Please fill the Details");
                }
            };


        }
    });
    mifosX.ng.application.controller('CreateClientController', ['$scope', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$routeParams', '$route', mifosX.controllers.CreateClientController]).run(function ($log) {
        $log.info("CreateClientController initialized");
    });
}(mifosX.controllers || {}));
