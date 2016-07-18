package app.business;

import app.core.AbstractBC;
import br.gov.frameworkdemoiselle.lifecycle.Startup;
import br.gov.frameworkdemoiselle.stereotype.BusinessController;
import br.gov.frameworkdemoiselle.transaction.Transactional;
import app.entity.User;
import app.persistence.UserDAO;
import app.util.Util;

/**
 *
 * @author 70744416353
 */
@BusinessController
public class UserBC extends AbstractBC<User, Long, UserDAO> {

    /**
     *
     */
    @Startup
    public void load() {
        if (findAll().isEmpty()) {

            User user = new User();
            user.setName("ADMIN");
            user.setEmail("admin@demoiselle.gov.br");
            user.setSenha(Util.MD5("123456"));
            user.setPerfil("ADMINISTRADOR");

            getDelegate().insert(user);

            user = new User();
            user.setName("USUARIO");
            user.setEmail("usuario@demoiselle.gov.br");
            user.setSenha(Util.MD5("456789"));
            user.setPerfil("USUARIO");

            getDelegate().insert(user);
        }
    }

    /**
     *
     * @param email
     * @param senha
     * @return
     */
    public User loadEmailPass(String email, String senha) {
        return getDelegate().loadEmailPass(email, senha);
    }

}
