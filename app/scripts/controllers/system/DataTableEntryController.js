(function (module) {
    mifosX.controllers = _.extend(module, {
        DataTableEntryController: function (scope, location, routeParams, route, resourceFactory, $modal, dateFilter) {

            if (routeParams.tableName) {
                scope.tableName = routeParams.tableName;
            }
            if (routeParams.entityId) {
                scope.entityId = routeParams.entityId;
            }
            if (routeParams.resourceId) {
                scope.resourceId = routeParams.resourceId;
            }
            scope.formDat = {};
            scope.columnHeaders = [];
            scope.formData = {};
            scope.isViewMode = true;
            scope.tf = "HH:mm";
            scope.columnValueLookUp = [];
            scope.enableDependency = true;
            if(routeParams.mode && routeParams.mode == 'edit'){
                scope.isViewMode = false;
            }

            var reqparams = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true'};
            if (scope.resourceId) {
                reqparams.resourceId = scope.resourceId;
            }

            resourceFactory.DataTablesResource.getTableDetails(reqparams, function (data) {
                for (var i in data.columnHeaders) {
                    if (data.columnHeaders[i].columnCode) {
                        //logic for display codeValue instead of codeId in view datatable details
                        for (var j in data.columnHeaders[i].columnValues) {
                            if(data.columnHeaders[i].columnDisplayType=='CODELOOKUP'){
                                if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                            } else if(data.columnHeaders[i].columnDisplayType=='CODEVALUE'){
                                if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].value) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                            }
                        }
                    } else {
                        data.columnHeaders[i].value = data.data[0].row[i];
                    }
                }
                scope.columnHeaders = data.columnHeaders;
                if(routeParams.mode && routeParams.mode == 'edit'){
                    scope.editDatatableEntry();
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

            scope.dateTimeFormat = function () {
                for (var i in scope.columnHeaders) {
                    if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                return scope.df;
            };

            scope.editDatatableEntry = function () {
                scope.isViewMode = false;
                var colName = scope.columnHeaders[0].columnName;
                if (colName == 'id') {
                    scope.columnHeaders.splice(0, 1);
                }

                colName = scope.columnHeaders[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    scope.columnHeaders.splice(0, 1);
                    scope.isCenter = colName == 'center_id' ? true : false;
                }
                scope.getDependencyColumns(true);
                for (var i in scope.columnHeaders) {

                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        scope.formDat[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[scope.columnHeaders[i].columnName] = {};
                        if(scope.columnHeaders[i].value != null) {
                            scope.formDat[scope.columnHeaders[i].columnName] = {
                                date: dateFilter(new Date(scope.columnHeaders[i].value), scope.df),
                                time: dateFilter(new Date(scope.columnHeaders[i].value), scope.tf)
                            };
                        }
                    } else {
                        scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    }
                    if (scope.columnHeaders[i].columnCode) {
                        for (var j in scope.columnHeaders[i].columnValues) {
                            if (scope.columnHeaders[i].value == scope.columnHeaders[i].columnValues[j].value) {
                                if(scope.columnHeaders[i].columnDisplayType=='CODELOOKUP'){
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].id;
                                    scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                                    var obj = angular.fromJson(scope.columnHeaders);
                                    for(var j in scope.columnHeaders[i].columnValues){
                                        obj[i].columnValuesLookup = scope.columnValueLookUp;
                                    }
                                } else if(scope.columnHeaders[i].columnDisplayType=='CODEVALUE'){
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].value;
                                    scope.columnValueLookUp = scope.columnHeaders[i].columnValues
                                    var obj = angular.fromJson(scope.columnHeaders);
                                    for(var j in scope.columnHeaders[i].columnValues){
                                        obj[i].columnValuesLookup = scope.columnValueLookUp;
                                    }
                                }
                            }
                        }
                    }
                    if (scope.columnHeaders[i].visibilityCriteria != "" && scope.columnHeaders[i].visibilityCriteria != null) {
                        for(var j in scope.columnHeaders[i].visibilityCriteria){
                            for(var k in scope.columnHeaders[i].visibilityCriteria[j].columnValue){
                                if(scope.columnHeaders[i].visibilityCriteria[j].columnValue[k].value == "true"){
                                    scope.enableDependency = false;
                                }else{
                                    scope.enableDependency = true;
                                }
                            }

                        }
                    }
                }
                if(obj != "" && obj != undefined){
                    scope.columnHeaders = obj;
                }

            };

            scope.getDependencyList = function(codeId) {
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
                            var obj = angular.fromJson(scope.columnHeaders);
                            for (var j in scope.columnHeaders[i].columnValues) {
                                obj[i].columnValuesLookup = scope.columnValueLookUp;
                            }
                        }
                    }
                    scope.columnHeaders = obj;
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

            scope.deleteDatatableEntry = function () {
                $modal.open({
                    templateUrl: 'deletedatatable.html',
                    controller: DatatableDeleteCtrl
                });
            };
            var DatatableDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.DataTablesResource.delete(reqparams, {}, function (data) {
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
                        $modalInstance.close('delete');
                        location.path(destination);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.cancel = function () {
                if(routeParams.mode){
                    window.history.back();
                } else{
                    route.reload();
                }

            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName], this.formData.dateFormat);
                    } else if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df) + " " +
                        dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }
                resourceFactory.DataTablesResource.update(reqparams, this.formData, function (data) {
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
    mifosX.ng.application.controller('DataTableEntryController', ['$scope', '$location', '$routeParams', '$route', 'ResourceFactory', '$modal', 'dateFilter', mifosX.controllers.DataTableEntryController]).run(function ($log) {
        $log.info("DataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
