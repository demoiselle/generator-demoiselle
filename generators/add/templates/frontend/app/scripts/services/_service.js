'use strict';

app.factory('<%=name%>Service', ['$http', '$q', function ($http, $q) {
        var service = {};

        service.get = function (id) {
            return $http.get('api/<%=name.toLowerCase()%>/' + id).then(function (res) {
                return res.data;
            });
        };

        service.delete = function (id) {
            return $http.delete('api/<%=name.toLowerCase()%>/' + id).then(function (res) {
                return res.data;
            });
        };

        service.save = function (<%=name%>) {
            return $http({
                url: 'api/<%=name.toLowerCase()%>',
                method: <%=name%>.id ? "PUT" : "POST",
                data: <%=name%>
            }).then();
        };

        service.list = function (field, order, init, qtde) {
            return $http.get('api/<%=name.toLowerCase()%>/' + field + '/' + order + '/' + init + '/' + qtde).then(
                function (res) {
                    return res.data;
                }
            );

        };

        service.count = function () {
            return $http.get('api/<%=name.toLowerCase()%>/count').then(function (res) {
                return res.data;
            });
        };

        return service;
    }]);

