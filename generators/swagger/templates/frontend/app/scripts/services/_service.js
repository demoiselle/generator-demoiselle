'use strict';

app.factory('<%=name%>Service', ['$http', function ($http) {
        var service = {};

        service.get = function (id) {
            return $http.get('api/<%=name.toLowerCase()%>/' + id).then(function (res) {
                return res;
            });
        };

        service.delete = function (id) {
            return $http.delete('api/<%=name.toLowerCase()%>/' + id).then(function (res) {
                return res;
            });
        };

        service.save = function (<%=name.toLowerCase()%>) {
            return $http({
                url: 'api/<%=name.toLowerCase()%>',
                method: <%=name.toLowerCase()%>.id ? "PUT" : "POST",
                data: <%=name.toLowerCase()%>
            }).then(
                function (res) {
                    return res;
                }
            );
        };

        service.list = function (field, order, init, qtde) {
            return $http.get('api/<%=name.toLowerCase()%>/' + field + '/' + order + '/' + init + '/' + qtde).then(
                function (res) {
                    return res;
                }
            );

        };

        service.count = function () {
            return $http.get('api/<%=name.toLowerCase()%>/count').then(function (res) {
                return res;
            });
        };

        return service;
    }]);

