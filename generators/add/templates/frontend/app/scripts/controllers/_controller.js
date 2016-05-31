'use strict';

app.controller('<%=name%>Controller', ['$scope', '$location', '$routeParams', '$rootScope', '<%=name%>Service', 'AlertService', 'ValidationService',
    function ($scope, $location, $routeParams, $rootScope, <%=name%>Service, AlertService, ValidationService) {

        $scope.count = function () {
            <%=name%>Service.count().then(
                function (res) {
                    $scope.totalServerItems = res.data;
                },
                function (res) {

                    var data = res.data;
                    var status = res.status;
                    var message = res.message;

                    if (status === 401) {
                        AlertService.addWithTimeout('warning', message);
                    } else if (status === 412 || status === 422) {
                        ValidationService.registrarViolacoes(data);
                    } else if (status === 403) {
                        AlertService.showMessageForbiden();
                    }

                }
            );
        };

        var id = $routeParams.id;
        var path = $location.$$url;

        if (path === '/<%=name.toLowerCase()%>') {
            ValidationService.clear();
            $scope.count();
        }
        ;

        if (path === '/<%=name.toLowerCase()%>/edit') {
            ValidationService.clear();
            $scope.<%=name%> = {};
        }
        ;

        if (path === '/<%=name.toLowerCase()%>/edit/' + id) {
            ValidationService.clear();
            <%=name%>Service.get(id).then(
                function (res) {
                    $scope.<%=name.toLowerCase()%> = res.data;
                },
                function (res) {

                    var data = res.data;
                    var status = res.status;
                    var message = res.message;

                    if (status === 401) {
                        AlertService.addWithTimeout('warning', message);
                    } else if (status === 412 || status === 422) {
                        ValidationService.registrarViolacoes(data);
                    } else if (status === 403) {
                        AlertService.showMessageForbiden();
                    }

                }

            );
        }

        $scope.pageChanged = function () {
            $scope.<%=name.toLowerCase()%>s = [];
            var num = (($scope.currentPage - 1) * $scope.itemsPerPage);
            <%=name%>Service.list(num, $scope.itemsPerPage).then(
                function (res) {
                    $scope.<%=name.toLowerCase()%>s = res.data;
                },
                function (res) {

                    var data = res.data;
                    var status = res.status;
                    var message = res.message;

                    if (status === 401) {
                        AlertService.addWithTimeout('warning', message);
                    } else if (status === 412 || status === 422) {
                        ValidationService.registrarViolacoes(data);
                    } else if (status === 403) {
                        AlertService.showMessageForbiden();
                    }

                }
            );
        };

        $scope.new = function () {
            $location.path('/<%=name.toLowerCase()%>/edit');
        };

        $scope.save = function () {

            <%=name%>Service.save($scope.<%=name.toLowerCase()%>).then(
                function (data) {
                    AlertService.addWithTimeout('success', '<%=name%> salvo com sucesso');
                    $location.path('/<%=name.toLowerCase()%>');
                },
                function (res) {

                    var data = res.data;
                    var status = res.status;
                    var message = res.message;

                    if (status === 401) {
                        AlertService.addWithTimeout('warning', message);
                    } else if (status === 412 || status === 422) {
                        ValidationService.registrarViolacoes(data);
                    } else if (status === 403) {
                        AlertService.showMessageForbiden();
                    }

                }
            );
        };

        $scope.delete = function (id) {
            <%=name%>Service.delete(id).then(
                function (data) {
                    AlertService.addWithTimeout('success', '<%=name%> removido com sucesso');
                    $location.path('/<%=name.toLowerCase()%>');
                    $scope.count();
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                },
                function (res) {

                    var data = res.data;
                    var status = res.status;
                    var message = res.message;

                    if (status === 401) {
                        AlertService.addWithTimeout('warning', message);
                    } else if (status === 412 || status === 422) {
                        ValidationService.registrarViolacoes(data);
                    } else if (status === 403) {
                        AlertService.showMessageForbiden();
                    }

                }
            );
        };

        $scope.edit = function (id) {
            $rootScope.<%=name.toLowerCase()%>CurrentPage = $scope.pagingOptions.currentPage;
            $location.path('/<%=name.toLowerCase()%>/edit/' + id);
        };

        function buscaElemento(elemento, lista) {
            var index = -1;
            for (var i = 0; i < lista.length; i++) {
                if (lista[i].nome === elemento.nome) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        $scope.filterOptions = {
            filterText: '',
            externalFilter: 'searchText',
            useExternalFilter: true
        };

        $scope.pagingOptions = {
            pageSizes: [15],
            pageSize: 15,
            currentPage: 1
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.myData = pagedData;
            $scope.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.getPagedDataAsync = function (pageSize, page) {
            var field;
            var order;
            if (typeof ($scope.sortInfo) === "undefined") {
                field = "id";
                order = "asc";
            } else {
                field = $scope.sortInfo.fields[0];
                order = $scope.sortInfo.directions[0];
            }

            setTimeout(function () {
                var init = (page - 1) * pageSize;
                <%=name%>Service.list(field, order, init, pageSize).then(
                    function (res) {
                        $scope.<%=name.toLowerCase()%>s = res.data;
                    },
                    function (res) {

                        var data = res.data;
                        var status = res.status;
                        var message = res.message;

                        if (status === 401) {
                            AlertService.addWithTimeout('warning', message);
                        } else if (status === 412 || status === 422) {
                            ValidationService.registrarViolacoes(data);
                        } else if (status === 403) {
                            AlertService.showMessageForbiden();
                        }

                    }
                );
            }, 100);
        };

        if ($rootScope.<%=name.toLowerCase()%>CurrentPage !== undefined) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $rootScope.<%=name.toLowerCase()%>CurrentPage);
            $scope.pagingOptions.currentPage = $rootScope.<%=name.toLowerCase()%>CurrentPage;
        } else {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }


        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
        }, true);

        $scope.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
        }, true);

        $scope.$watch('sortInfo', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }
        }, true);

        $scope.$on('ngGridEventSorted', function (event, sortInfo) {
            $scope.sortInfo = sortInfo;
        });

        $scope.gridOptions = {
            data: '<%=name.toLowerCase()%>s',
            columnDefs: [{field: 'id', displayName: '', width: "50"},
                {field: 'descricao', displayName: 'Descrição', width: "550"},
                {displayName: 'Ação', cellTemplate: '<a ng-show="!currentUser" ng-click="edit(row.entity.id)" class="btn btn-primary btn-xs"><i class="glyphicon glyphicon-eye-open"></i> Visualizar</a>\n\
                                                 <a ng-show="currentUser" ng-click="edit(row.entity.id)" class="btn btn-success btn-xs"><i class="glyphicon glyphicon-plus-sign"></i> Alterar</a>\n\
                                                 <a has-roles="ADMINISTRADOR" confirm-button title="Excluir?" confirm-action="delete(row.entity.id)" class="btn btn-danger btn-xs"><i class="glyphicon glyphicon-minus-sign"></i> Excluir</a>', width: "200"}],
            selectedItems: [],
            keepLastSelected: true,
            sortInfo: $scope.sortInfo,
            multiSelect: false,
            enablePaging: true,
            showFooter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            enableSorting: true,
            useExternalSorting: true,
            i18n: "pt"
        };

        $scope.$on('$routeChangeStart', function (event, next) {
            if (next.originalPath.indexOf("<%=name.toLowerCase()%>") === -1) {
                $rootScope.<%=name.toLowerCase()%>CurrentPage = 1;
            }
        });

    }]);



