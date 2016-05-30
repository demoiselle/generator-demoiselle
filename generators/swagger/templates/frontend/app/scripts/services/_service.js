'use strict';

app.factory('<%=props.caminho.split("/")[1].charAt(0).toUpperCase() + props.caminho.split("/")[1].slice(1)%>Service', ['$http', function ($http) {
        var service = {};

        <%props.propriedades.forEach(function (item) {%>

            service.save = function (<%=entityName.toLowerCase()%>) {
            return $http({
                url: 'api/<%=item.caminho%>',
                method: <%=entityName.toLowerCase()%>.id ? "PUT" : "POST",
                data: <%=entityName.toLowerCase()%>
            }).then();
        };

        <% }) %>

        return service;
    }]);

