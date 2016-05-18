'use strict';

app.config(['$routeProvider', 'USER_ROLES',
    function ($routeProvider, USER_ROLES) {

        $routeProvider

                .when('/', {
                    templateUrl: 'views/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    data: {
                        authorizedRoles: [USER_ROLES.ADMINISTRADOR, USER_ROLES.USUARIO]
                    }
                })

                .when('/dashboard', {
                    templateUrl: 'views/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    data: {
                        authorizedRoles: [USER_ROLES.ADMINISTRADOR, USER_ROLES.USUARIO]
                    }
                })

    }]);