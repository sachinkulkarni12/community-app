(function (module) {
    mifosX.controllers = _.extend(module, {
        MakeDataTableEntryController: function (scope, location, routeParams, resourceFactory, dateFilter, filter) {
            scope.tableName = routeParams.tableName;
            scope.entityId = routeParams.entityId;
            scope.fromEntity = routeParams.fromEntity;
            scope.columnHeaders = [];
            scope.formData = {};
            scope.formDat = {};
            scope.tf = "HH:mm";
            scope.columnValueLookUp = [];
            scope.newcolumnHeaders = [];
            scope.enableDependency = true;

            resourceFactory.DataTablesResource.getTableDetails({ datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true' }, function (data) {

                var colName = data.columnHeaders[0].columnName;
                if (colName == 'id') {
                    data.columnHeaders.splice(0, 1);
                }
                colName = data.columnHeaders[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    data.columnHeaders.splice(0, 1);
                    scope.isCenter = colName == 'center_id' ? true : false;
                }
                 for (var i in data.columnHeaders) {
                    if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[data.columnHeaders[i].columnName] = {};
                    }
                    if(data.columnHeaders[i].columnDisplayType == 'CODELOOKUP' && data.columnHeaders[i].columnValues){
                        scope.columnValueLookUp = data.columnHeaders[i].columnValues
                        scope.newcolumnHeaders = angular.fromJson(data.columnHeaders);
                        for(var j in data.columnHeaders[i].columnValues){
                            scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                        }

                    }
                    if (data.columnHeaders[i].visibilityCriteria != "" && data.columnHeaders[i].visibilityCriteria != null) {
                        for(var j in data.columnHeaders[i].visibilityCriteria){
                            for(var k in data.columnHeaders[i].visibilityCriteria[j].columnValue){
                                if(data.columnHeaders[i].visibilityCriteria[j].columnValue[k].value == "true"){
                                    scope.enableDependency = false;
                                }else{
                                    scope.enableDependency = true;
                                }
                            }
                        }
                    }
                 }
                if(scope.newcolumnHeaders != ""){
                    scope.columnHeaders = scope.newcolumnHeaders;
                }else{
                    scope.columnHeaders = data.columnHeaders;
                }


            });

            scope.getDependencyList = function (codeId) {
                if (codeId != null) {
                    scope.columnValuesLookup = [];
                    var count = 0;
                    for (var i in scope.columnHeaders) {
                        var obj = angular.fromJson(scope.columnHeaders);
                        if (scope.columnHeaders[i].columnValues != null && scope.columnHeaders[i].columnValues != "") {
                            for (var j in scope.columnHeaders[i].columnValues) {
                                if (scope.columnHeaders[i].columnValues[j].parentId > 0 && scope.columnHeaders[i].columnValues[j].parentId === codeId) {
                                    scope.columnValuesLookup.push(scope.columnHeaders[i].columnValues[j])
                                } else {
                                    if (scope.columnHeaders[i].columnValues[j].id == codeId) {
                                        var id = scope.columnHeaders[i].columnValues[j].parentId;
                                        for (var k in scope.columnHeaders) {
                                            for (var n in scope.columnHeaders[k].columnValues) {
                                                if (scope.columnHeaders[k].columnValues[n].id === id) {
                                                    scope.formData[scope.columnHeaders[k].columnName] = scope.columnHeaders[k].columnValues[n].id;
                                                    scope.dependentCodeId = scope.columnHeaders[k].columnValues[n].id;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                            if (scope.columnValuesLookup != null && scope.columnValuesLookup != "" && count == 0) {
                                obj[i].columnValuesLookup = scope.columnValuesLookup;
                                count++;
                            }
                        }
                    }
                    scope.columnHeaders = obj;
                    if(scope.tempDependentCodeId != scope.dependentCodeId){
                        scope.tempDependentCodeId = angular.copy(scope.dependentCodeId);
                        scope.getDependencyList(scope.dependentCodeId);
                    }
                } else {
                    for (var i in scope.columnHeaders) {
                        if (scope.columnHeaders[i].columnDisplayType == 'CODELOOKUP' && scope.columnHeaders[i].columnValues) {
                            scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                            scope.newcolumnHeaders = angular.fromJson(scope.columnHeaders);
                            for (var j in scope.columnHeaders[i].columnValues) {
                                scope.newcolumnHeaders[i].columnValuesLookup = scope.columnValueLookUp;
                            }
                        }
                    }
                    scope.columnHeaders = scope.newcolumnHeaders;
                }
            }

            scope.getDependencyColumns = function (codeId){
                for(var i in scope.columnHeaders){
                    if (scope.columnHeaders[i].visibilityCriteria != "") {
                        for(var j in scope.columnHeaders[i].visibilityCriteria){
                            for(var k in scope.columnHeaders[i].visibilityCriteria[j].columnValue){
                                if(Boolean(scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value) == codeId){
                                    if(!codeId){
                                        this.formData[scope.columnHeaders[i].columnName] = '';
                                        this.formDat[scope.columnHeaders[i].columnName] = '';
                                    }
                                    scope.enableDependency = codeId;
                                    scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value = !codeId;
                                }
                            }
                        }
                    }
                }
            }

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

            scope.dateTimeFormat = function () {
                for (var i in scope.columnHeaders) {
                    if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                return scope.df;
            };

            scope.cancel = function () {
                if (scope.fromEntity == 'client') {
                    location.path('/viewclient/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'group') {                    
                    location.path('/viewgroup/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'center') {                    
                    location.path('/viewcenter/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'loan') {                    
                    location.path('/viewloanaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'savings') {
                    location.path('/viewsavingaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'office') {
                    location.path('/viewoffice/' + routeParams.entityId).search({});
                };
            };
            scope.submit = function () {
                var params = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                //below logic, for the input field if data is not entered, this logic will put "", because
                //if no data entered in input field , that field name won't send to server side.
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName],
                            this.formData.dateFormat);
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df)
                        + " " + dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }


                resourceFactory.DataTablesResource.save(params, this.formData, function (data) {
                    var destination = "";
                    if (data.loanId) {
                        destination = '/viewloanaccount/' + data.loanId;
                    } else if (data.savingsId) {
                        destination = '/viewsavingaccount/' + data.savingsId;
                    } else if (data.clientId) {
                        destination = '/viewclient/' + data.clientId;
                    } else if (data.groupId) {
                        if (scope.isCenter) {
                            destination = '/viewcenter/' + data.groupId;
                        } else {
                            destination = '/viewgroup/' + data.groupId;
                        }
                    } else if (data.officeId) {
                        destination = '/viewoffice/' + data.officeId;
                    }
                    location.path(destination);
                });
            };

        }
    });
    mifosX.ng.application.controller('MakeDataTableEntryController', ['$scope', '$location', '$routeParams', 'ResourceFactory', 'dateFilter', '$filter', mifosX.controllers.MakeDataTableEntryController]).run(function ($log) {
        $log.info("MakeDataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
