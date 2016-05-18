'use strict';

app.config(['$routeProvider', 'USER_ROLES',
    function ($routeProvider, USER_ROLES) {

        $routeProvider


                .when('/<%=name.toLowerCase()%>', {
                    templateUrl: 'views/<%=name.toLowerCase()%>/list.html',
                    controller: '<%=name%>Controller',
                    data: {
                        authorizedRoles: [USER_ROLES.ADMINISTRADOR, USER_ROLES.USUARIO]
                    }
                })

                .when('/<%=name.toLowerCase()%>/edit', {
                    templateUrl: 'views/<%=name.toLowerCase()%>/edit.html',
                    controller: '<%=name%>Controller',
                    data: {
                        authorizedRoles: [USER_ROLES.ADMINISTRADOR]
                    }
                })

                .when('/<%=name.toLowerCase()%>/edit/:id', {
                    templateUrl: 'views/<%=name.toLowerCase()%>/edit.html',
                    controller: '<%=name%>Controller',
                    data: {
                        authorizedRoles: [USER_ROLES.ADMINISTRADOR]
                    }
                });




    }]);
