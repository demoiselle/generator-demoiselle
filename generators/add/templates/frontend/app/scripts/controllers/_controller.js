'use strict';

app.controller('<%=name%>Controller', ['$q', '$scope', '$rootScope', '$filter', '$timeout', '<%=name%>Service', 'ProdutoService', 'AlertService',
    function ($q, $scope, $rootScope, $filter, $timeout, <%=name%>Service, ProdutoService, AlertService) {

        var orderBy = $filter('orderBy');
        $scope.tema = "";
        $scope.produto = "";
        $scope.resultadoProdutos = [];
        $scope.temas = [];
        $scope.fases = [];
        $scope.produtos = [];

        $scope.seguindo = [];
        $scope.filteredSeguindo = [];

        <%=name%>Service.get().then(function (data) {
            $scope.resultadoProdutos = [];
            $scope.temas = data;
            $scope.orderTemas = function (predicate, reverse) {
                $scope.temas = orderBy($scope.temas, predicate, reverse);
            };
            $scope.orderTemas('nome', false);
        });

        $scope.carregarProdutos = function () {
            ProdutoService.listarProdutosUnicosPorTema($scope.tema.id).then(function (data) {
                $scope.resultadoProdutos = data;
            });
        };

        function getFasesUrl(fluxo) {
            var html = "";
            for (var i = 0; i < fluxo.length; i++) {
                var f = fluxo[i];
                html += '<a href="#/' + $filter("faseUrl")(f.fase) + '/' + f.id + '">' + $filter("nomeFase")(f.fase) + '</a>';
            }
            return html;
        }


        function formatarData(date) {
            if (date == null || date == undefined)
                return new Date();
            //var from = date.split("-");
            //var f = new Date(from[0], from[1] - 1, from[2]);
            return date;
        }

        var templateMercado = '<img src="images/rocket.png"> {version} ';
        var templateMercadoDescontinuidade = '<img src="images/grave.png"> {version} ';
        var templateSerpro = '<img src="images/serpro.png"> {version} - {fases}';

        $scope.carregarTimeline = function () {
            $scope.versoes = null;
            <%=name%>Service.getProdutoComVersoesEFases($scope.produto).then(function (data) {
                $scope.versoes = [];

                for (var x = 0; x < data.length; x++) {
                    var v = data[x];
                    var classe = 'version' + (x + 1);
                    if (v.data != null) {
                        $scope.versoes.push({
                            'start': formatarData(new Date(v.data)),
                            'content': templateMercado.replace("{version}", v.nome + ' v.' + v.versao),
                            'className': classe
                        });
                    }
                    if (v.dataDescontinuidade != null) {
                        $scope.versoes.push({
                            'start': formatarData(new Date(v.dataDescontinuidade)),
                            'content': templateMercadoDescontinuidade.replace("{version}", v.nome + ' v.' + v.versao),
                            'className': classe
                        });
                    }

                    if (v.fases) {
                        for (var y = 0; y < v.fases.length; y++) {
                            var fase = v.fases[y];
                            $scope.versoes.push({
                                'start': formatarData(new Date(fase.dataRealizacao)),
                                'end': formatarData(new Date(fase.dataFinalizacao)),
                                'content': templateSerpro.replace("{version}", v.nome + ' v.' + v.versao)
                                    .replace("{fases}", getFasesUrl([{id: fase.id, fase: fase.fase}])),
                                'className': classe
                            });
                        }
                    }
                }

                if ($scope.versoes.length == 0) {
                    AlertService.addWithTimeout('danger', 'Não foi encontrado fases para (' + $scope.produto + ')');
                }

            });
        };

        $scope.call = 0;
        $scope.titulo = "Fase";
        $scope.classe = "default";
        $scope.produtos = [1 + $scope.call, 2 + $scope.call, 3 + $scope.call, 4 + $scope.call, 5 + $scope.call];
        $scope.fases = [1 + $scope.call, 2 + $scope.call, 3 + $scope.call, 4 + $scope.call, 5 + $scope.call];
        var pollproduto = function () {
            $timeout(function () {
                $rootScope.$apply(function () {
                    $scope.produtos = [];
                });
                $rootScope.$apply(function () {
                    $scope.produtos = [1 + $scope.call, 2 + $scope.call, 3 + $scope.call, 4 + $scope.call, 5 + $scope.call];
                });
                pollproduto();
            }, 7000);
        };

        var pollfase = function () {
            $timeout(function () {
                $rootScope.$apply(function () {
                    $scope.fases = [];
                    $scope.titulo = "";
                });
                $rootScope.$apply(function () {
                    $scope.fases = [1 + $scope.call, 2 + $scope.call, 3 + $scope.call, 4 + $scope.call, 5 + $scope.call];
                    $scope.titulo = "Fase";
                    switch ($scope.call) {
                        case 0:
                            $scope.classe = "default";
                            break;
                        case 1:
                            $scope.classe = "primary";
                            break;
                        case 2:
                            $scope.classe = "success";
                            break;
                        case 3:
                            $scope.classe = "info";
                            break;
                        case 4:
                            $scope.classe = "warning";
                            break;
                        case 5:
                            $scope.classe = "danger";
                            $scope.call = 0;
                            break;
                    }
                });
                $scope.call++;
                pollfase();
            }, 9000);
        };

        var pollupdate = function () {
            $timeout(function () {
                //pegar dados do servidor
                pollupdate();
            }, 600000);
        };

        pollproduto();
        pollfase();

    }]);
