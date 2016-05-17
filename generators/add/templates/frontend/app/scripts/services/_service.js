'use strict';

var backendUrl = '';

app.factory('<%=name%>Service', ['$http', function ($http) {
    
    var service = {};

    service.get = function () {
        return $http
                .get('api/tema')
                .then(function (res) {
                    return res.data;
                });
    };

    service.obterDemandas = function () {
        return $http
                .get('api/<%=name%>/minhasDemandas')
                .then(function(res) {
                    return res.data;
                });
    };

    service.getTotalFases = function () {
        return $http
                .get('api/<%=name%>/totalfases')
                .then(function(res) {
                    return res.data;
                });
    };

    service.getProdutoComVersoesEFases = function(nome) {
        nome = nome.replace('/', '|');
        return $http
                .get('api/fase/produto/produtoComVersoesEFases/' + nome)
                .then(function(res) {
                    return res.data;
                }
            );
    };

    return service;
}]);

