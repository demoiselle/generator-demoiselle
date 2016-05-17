package app.security;

import javax.inject.Inject;

import br.gov.frameworkdemoiselle.security.SecurityContext;
import app.entity.Perfil;
import app.entity.User;

/**
 *
 * @author 70744416353
 */
public class Authorizer implements br.gov.frameworkdemoiselle.security.Authorizer {

    private static final long serialVersionUID = 1L;

    @Inject
    private SecurityContext securityContext;

    /**
     *
     * @param role
     * @return
     * @throws Exception
     */
    @Override
    public boolean hasRole(String role) throws Exception {
        if (securityContext.isLoggedIn()) {
            User user = (User) securityContext.getUser();
            if (user.getPerfil() != null) {
                if (!role.equalsIgnoreCase(Perfil.getPerfil(user.getPerfil()).name())) {
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @param resource
     * @param operation
     * @return
     * @throws Exception
     */
    @Override
    public boolean hasPermission(String resource, String operation) throws Exception {
        return false;
    }

}
