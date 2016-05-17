'use strict';

app.directive('donut', function () {
    return {
        restrict: 'A',
        scope: {
            donutData: '=',
            donutColors: '='
        },
        link: function (scope, element, attrs) {
            var config = {
                element: element,
                data: scope.donutData,
                resize: true
            };
            if (scope.donutColors) {
                config.colors = scope.donutColors;
            }

            Morris.Donut(config);
        }
    };
});

app.directive('timeline', function ($timeout) {
    return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
            ngModel: '=',
            id: '@'
        },
        link: function (scope, elem, $attrs) {
            $timeout(function () {
                var container = document.getElementById($attrs.id);
                var options = {
                    'width': '100%',
                    'height': 'auto',
                    'locale': 'pt-BR',
                    'editable': false,
                    'showNavigation': true
                };
                var timeline = new links.Timeline(container);
                timeline.draw(scope.ngModel, options);
            });

        }
    };
});
 
app.directive('uiLinhabar', ['$rootScope', '$anchorScroll', function($rootScope, $anchorScroll) {
    return {
        restrict: 'AC',
        template: '<span class="bar"></span>',
        link: function(scope, el, attrs) {
            el.addClass('linhabar hide');

            scope.$on('$routeChangeStart', function(e) {
                $anchorScroll();
                el.removeClass('hide').addClass('active');
            });
            
            scope.$on('$routeChangeSuccess', function(event, toState, toParams, fromState) {
                event.targetScope.$watch('$viewContentLoaded', function() {
                    el.addClass('hide').removeClass('active');
                });
            });

            scope.$on('loading-started', function(e) {
                el.removeClass('hide').addClass('active');
            });

            scope.$on('loading-complete', function(e) {
                el.addClass('hide').removeClass('active');
            });
        }
    }
}]);

app.directive('backButton', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                history.back();
                scope.$apply();
            });
        }
    };
});

app.directive('alerts', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/alerts.html'
    };
});

app.directive('autofill', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            scope.$on('autofill:update', function() {
                ngModel.$setViewValue(element.val());
            });
        }
    };
});

app.directive('hasRoles', ['AuthService', function(AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {

            var paramRoles = attributes.hasRoles.split(',');

            if (!AuthService.isAuthorized(paramRoles)) {
                element.remove();
            }
        }
    };
}]);

app.directive('isLogged', ['AuthService', function(AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            if(!AuthService.isAuthenticated()){
                element.remove();
            }
        }
    };
}]);

app.directive('confirmButton', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            actionOK: '&confirmAction',
            actionCancel: '&cancelAction'
        },
        link: function(scope, element, attrs) {
            var buttonId, html, message, nope, title, yep;
            buttonId = Math.floor(Math.random() * 10000000000);
            attrs.buttonId = buttonId;
            message = attrs.message || 'Tem certeza?';
            yep = attrs.yes || 'Sim';
            nope = attrs.no || 'Não';
            title = attrs.title || 'Confirmação';

            element.bind('click', function(e) {

                var box = bootbox.dialog({
                    message: message,
                    title: title,
                    buttons: {
                        success: {
                            label: yep,
                            className: 'btn-success',
                            callback: function() {
                                $timeout(function() {
                                    scope.$apply(scope.actionOK);
                                });
                            }
                        },
                        danger: {
                            label: nope,
                            className: 'btn-danger',
                            callback: function() {
                                scope.$apply(scope.actionCancel);
                            }
                        }
                    }
                });

            });
        }
    };
});

app.directive('fluxo', [function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/fluxo.html',
        link: function(scope, elem, $attrs) {

        }
    };
}]);

app.directive('fluxoProduto', [function() {
    return {
        restrict: 'E',
        scope: {
            produto: '='
        },
        templateUrl: 'partials/fluxo-produto.html',
        link: function(scope, elem, $attrs) {

        }
    };
}]);

app.directive('faseStatus', [function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/fase-status.html',
        link: function(scope, elem, $attrs) {

        }
    };
}]);

app.directive('anexos', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/anexo.html',
        link: function(scope, elem, $attrs) {
        }
    };
});


app.directive('observacoes', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/observacoes.html',
        link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('proximaFase', function() {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            fase: '=',
            selecionar: '&'          
        },
        templateUrl: 'partials/proxima-fase.html',
        controller: function($rootScope, $scope, FaseService) {  

            $scope.proximaFasedataPrevisaoTerminioOpened = false;

            $scope.ciclo = {numero: 0, fator: 1};

            if($scope.fase.id){
                FaseService.carregarProdutosRelacionados($scope.fase.id).then(function(produtos){
                    $scope.produtos = produtos;
                    $rootScope.$broadcast('produtoAdicionadoFase', produtos);
                });          
            }

            $rootScope.$on('produtoAdicionadoFase', function(event, produtos){
                $scope.produtos = produtos;
            });
            
            $scope.marcarProduto = function(produto) {
                $scope.selecionar({produto: produto});
            };

            function atualizarCiclo(newValue){  
                var ciclo = $scope.ciclo.numero * $scope.ciclo.fator;
                $scope.fase.proximaFaseCiclo = ciclo;
            }
           
            $scope.$watch('ciclo.numero', function(newValue, oldValue) {
                atualizarCiclo(newValue);
            });
            
            $scope.$watch('ciclo.fator', function(newValue, oldValue) {
                atualizarCiclo(newValue);
            });

            $scope.openProximaFaseDataPrevisaoTerminio = function($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.proximaFasedataPrevisaoTerminioOpened = true;
            };

        }
    };
});

app.directive('historicoFase', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/historico-fase.html'
    };
});

app.directive('interessados', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/interessados.html',
        link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('validationMsg', ['ValidationService', function(ValidationService) {
    return {
        restrict: 'E',
        scope: {
            propriedade: '@'
        },
        template: '<div class="error text-danger" ng-show="msg"><small class="error" >{{msg}}</small></div>',
        controller: function($scope) {
            $scope.$watch(function() {
                return ValidationService.validation[$scope.propriedade];
            },
                    function(msg) {
                        $scope.msg = msg;
                    }
            );
        }
    };
}]);

app.directive('analiseSituacaoButton', function() {
    return {
        scope: {
            situacao: '@'
        },
        transclude: true,
        template: '<a data-toggle="dropdown" class="btn btn-sm  dropdown-toggle">'
                + '<i class="glyphicon"></i> {{situacao}} <span class="caret"></span>'
                + '</a>'
                + '<ul class="dropdown-menu dropdown" ng-transclude>'
                + '</ul>',
        link: function(scope, element, attrs) {

            attrs.$observe('situacao', function(situacao) {
                var btnClasses = 'btn-primary btn-success btn-danger';
                var iconClasses = 'glyphicon glyphicon-edit glyphicon-thumbs-up glyphicon-thumbs-down';
                var btnType = 'btn-primary';
                var icon = 'glyphicon glyphicon-edit';

                if (situacao === 'Aprovado') {
                    btnType = 'btn-success';
                    icon = 'glyphicon glyphicon-thumbs-up';
                } else if (situacao === 'Reprovado') {
                    btnType = 'btn-danger';
                    icon = 'glyphicon glyphicon-thumbs-down';
                }

                $(element).children().first().removeClass(btnClasses).addClass(btnType)
                        .children().first().removeClass(iconClasses).addClass(icon);
            });

        }
    };
});

app.directive('campoUsuario', function() {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            usuario: '=ngModel',
            fase: '@',
            name: '@'
        },
        templateUrl: 'partials/campo-usuario.html',
        link: function(scope, element, attributes) {

        },
        controller: function($scope, $http, AlertService, UsuarioService) {

            $scope.palavraChave = '';
            $scope.resultadoPesquisa = [];

            $scope.selecionar = function(m) {
                $http({
                    url: 'api/fase/usuario/carregar',
                    method: 'POST',
                    data: m
                }).success(function(data) {
                    $scope.usuario = data;
                    delete $scope.usuario.grupos;
                }).error(function(data, status) {
                    AlertService.addWithTimeout('danger', data[0].message);
                });

            };

            $scope.pesquisar = function() {

                var MIN_NUMBER_OF_NAME_CARACTERS = 5;

                if ($scope.palavraChave.length >= MIN_NUMBER_OF_NAME_CARACTERS) {
                    UsuarioService.searchByName($scope.palavraChave).then(function(usuario) {
                        if (usuario === '') {
                            AlertService.addWithTimeout('warning', 'Usuário não cadastrado no LDAP');
                        }
                        else {
                            $scope.resultadoPesquisa = usuario;
                        }
                    },
                    function(res) {
                        var data = res.data;
                        var status = res.status;

                        if (status === 412) {
                            AlertService.addWithTimeout('danger', data[0].message);
                        }
                        else if (status === 413) {
                            AlertService.addWithTimeout('danger', 'O servidor não suporta a quantidade de registros retornados. Por favor, seja mais restritivo em sua pesquisa.');
                        }
                    });
                }
                else {
                    AlertService.addWithTimeout('warning', 'Digite pelo menos ' + MIN_NUMBER_OF_NAME_CARACTERS + ' caracteres para realizar a consulta.');
                }

            };
        }
    };
});

app.directive('membros', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/membros.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('referencias', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/referencias.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('produtosDaFase', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='            
        },
        templateUrl: 'partials/produtos-da-fase.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('maxLength', ['$compile', 'AlertService', function($compile, AlertService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            attrs.$set('ngTrim', 'false');
            var maxlength = parseInt(attrs.maxLength, 10);
            ctrl.$parsers.push(function(value) {
                if (value !== undefined && value.length !== undefined) {
                    if (value.length > maxlength) {
                        AlertService.addWithTimeout('warning', 'O valor máximo de caracteres (' + maxlength + ') para esse campo já foi alcançado');
                        value = value.substr(0, maxlength);
                        ctrl.$setViewValue(value);
                        ctrl.$render();
                    }
                }
                return value;
            });
        }
    };
}]);

app.directive('hasRolesDisable', ['AuthService', function(AuthService) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {

            var paramRoles = attributes.hasRolesDisable.split(',');

            if (!AuthService.isAuthorized(paramRoles)) {
                angular.forEach(element.find('input, select, textarea, button, a'), function(node){ 
                    var ele = angular.element(node);
                    ele.attr('disabled', 'true');                    
                });
            }
        }
    };
}]);

app.directive('hasGroupPermissionDisable', ['AuthService', '$http', function(AuthService, $http) {
    return{
        restrict: 'A',
        link: function(scope, element, attributes) {
            var fase = JSON.parse(attributes.hasGroupPermissionDisable);
            var roles = fase.fase;

            if(fase.id){

                if(AuthService.isAuthorized(roles)){

                    $http.get('api/fase/hasGroupPermission/' + fase.id).then(function(resp){
                       
                    }, function(resp){
                        if(resp.status === 403){
                             angular.forEach(element.find('input, select, textarea, button, a'), function(node){ 
                                var ele = angular.element(node);
                                ele.attr('disabled', 'true');   
                            });
                        }
                    });
                }
            }
        }
    };    

}]);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.directive('ckEditor', [function () {
    return {
        require: '?ngModel',
        scope: {
        },
        link: function ($scope, elm, attr, ngModel) {

            var ck = CKEDITOR.replace(elm[0]);

            ck.on('pasteState', function () {
                $scope.$apply(function () {
                    ngModel.$setViewValue(ck.getData());
                });
            });

            ngModel.$render = function (value) {
                ck.setData(ngModel.$modelValue);
            };
        }
    };
}]);

app.directive('produtotema', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/produto-tema.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('referenciaCadastro', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/referencia-cadastro.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('produtofabricante', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/produto-fabricante.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('produtofornecedor', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/produto-fornecedor.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('produtolicenciamento', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/produto-licenciamento.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('produtoplataformatecnologica', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/produto-plataformatecnologica.html',
            link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('sistemausuario', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/sistema-usuario.html',
        link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('sistemaproduto', function() {
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        templateUrl: 'partials/sistema-produto.html',
        link: function(scope, elem, $attrs) {
        }
    };
});

app.directive('quantidadeAlteracoesPrevisaoTerminio', function(){
    return {
        restrict: 'E',
        scope: {
            fase: '='
        },
        template: '<span class="label label-pill label-danger" title="Quantidade de vezes que essa data foi alterada.">{{qtdeDataPrevisaoTerminioAltarada}}</span>',
        controller: function($scope, HistoricoService) {
            $scope.qtdeDataPrevisaoTerminioAltarada = 0;

            HistoricoService.getQtdeAlteracoesDataPrevisaoTerminio($scope.fase.id).then(function(qtde){
                $scope.qtdeDataPrevisaoTerminioAltarada = qtde;
            });

        }

    };
});

app.directive('produtoSeguir', [function() {
    return {
        restrict: 'E',
        scope: {
            produto: '='
        },
        templateUrl: 'partials/produto-seguir.html',
        link: function(scope, elem, $attrs) {

        }
    };
}]);