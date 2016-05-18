'use strict';

app.config(['$routeProvider', 'USER_ROLES',
    function ($routeProvider, USER_ROLES) {

        $routeProvider

                .when('/swagger', {
                    templateUrl: 'views/swagger.html',
                    controller: 'SwaggerController',
                    data: {authorizedRoles: [USER_ROLES.ADMINISTRADOR, USER_ROLES.USUARIO]
                    }
                })

    }]);