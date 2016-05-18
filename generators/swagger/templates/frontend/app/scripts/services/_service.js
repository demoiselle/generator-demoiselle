'use strict';

app.factory('<%=classe%>Service', ['$http', function ($http) {
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

        service.save = function (<%=name.toLowerCase()%>) {
            return $http({
                url: 'api/<%=name.toLowerCase()%>',
                method: <%=name.toLowerCase()%>.id ? "PUT" : "POST",
                data: <%=name.toLowerCase()%>
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

