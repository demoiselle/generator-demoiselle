'use strict';

app.factory('UsuarioService', ['$http', function ($http) {
        var service = {};

        service.get = function (id) {
            return $http.get('api/user/' + id).then(function (res) {
                return res;
            });
        };

        service.delete = function (id) {
            return $http.delete('api/user/' + id).then(function (res) {
                return res;
            });
        };

        service.count = function () {
            return $http.get('api/user/count').then(function (res) {
                return res;
            });
        };

        service.list = function (field, order, init, qtde) {
            return $http.get('api/user/' + field + '/' + order + '/' + init + '/' + qtde).then(
                function (res) {
                    return res;
                }
            );

        };

        service.save = function (user) {
            return $http({
                url: 'api/user',
                method: user.id ? "PUT" : "POST",
                data: user
            }).then(
                function (res) {
                    return res;
                }
            );
        };

        return service;
    }]);
