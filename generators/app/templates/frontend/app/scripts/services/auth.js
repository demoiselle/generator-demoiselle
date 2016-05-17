'use strict';

app.factory('AuthService', ['$http', 'AppService', '$rootScope', 'UsuarioService',
    function ($http, AppService, $rootScope, UsuarioService) {

        var authService = {};

        authService.login = function (credentials) {

            AppService.removeToken();

            return $http
                .post('api/auth', credentials)
                .success(function (res, status, headers) {

                    AppService.setToken(headers('Set-Token'));
                    $rootScope.currentUser = AppService.getUserFromToken();
                    getPhoto();
                    return res;
                }
                );



        };

        authService.getPhoto = function () {
            if ($rootScope.currentUser) {
                UsuarioService.getPhoto($rootScope.currentUser.id).then(
                    function (foto) {
                        $rootScope.currentPhoto = foto.imagem;
                    }
                );
            }
        };

        authService.setCss = function (css) {
            AppService.setCss(css);
        };

        authService.getCss = function () {
            return AppService.getCss();
        };

        authService.logout = function () {

            return $http
                .delete('api/auth')
                .then(function () {
                    AppService.removeToken();
                }
                );
        };

        authService.isAuthenticated = function () {
            return $rootScope.currentUser ? true : false;
        };

        authService.isAuthorized = function (authorizedRoles) {

            var hasAuthorizedRole = false;

            if (authService.isAuthenticated()) {

                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }

                var grupos = $rootScope.currentUser.grupos;

                if (grupos !== undefined && grupos !== null) {
                    for (var i = 0; i < authorizedRoles.length; i++) {
                        for (var j = 0; j < grupos.length; j++) {
                            for (var k = 0; k < grupos[j].perfis.length; k++) {
                                if (authorizedRoles[i].indexOf(grupos[j].perfis[k]) !== -1) {
                                    hasAuthorizedRole = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            } else {
                return false;
            }

            return hasAuthorizedRole;
        };

        return authService;
    }]);

