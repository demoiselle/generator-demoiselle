'use strict';

app.factory('<%=entityName%>Service', ['$http', function ($http) {
        var service = {};

        service.get = function (id) {
            return $http.get('api/<%=entityName.toLowerCase()%>/' + id).then(function (res) {
                return res.data;
            });
        };

        service.delete = function (id) {
            return $http.delete('api/<%=entityName.toLowerCase()%>/' + id).then(function (res) {
                return res.data;
            });
        };

        service.save = function (<%=entityName.toLowerCase()%>) {
            return $http({
                url: 'api/<%=entityName.toLowerCase()%>',
                method: <%=entityName.toLowerCase()%>.id ? "PUT" : "POST",
                data: <%=entityName.toLowerCase()%>
            }).then();
        };

        service.list = function (field, order, init, qtde) {
            return $http.get('api/<%=entityName.toLowerCase()%>/' + field + '/' + order + '/' + init + '/' + qtde).then(
                function (res) {
                    return res.data;
                }
            );

        };

        service.count = function () {
            return $http.get('api/<%=entityName.toLowerCase()%>/count').then(function (res) {
                return res.data;
            });
        };

        return service;
    }]);

