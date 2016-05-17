package app.business;

import br.gov.frameworkdemoiselle.lifecycle.Startup;
import br.gov.frameworkdemoiselle.stereotype.BusinessController;
import br.gov.frameworkdemoiselle.template.DelegateCrud;
import br.gov.frameworkdemoiselle.transaction.Transactional;
import app.entity.User;
import app.persistence.UserDAO;
import java.util.List;
import app.util.Util;

/**
 *
 * @author 70744416353
 */
@BusinessController
public class UserBC extends DelegateCrud<User, Long, UserDAO> {

    private static final long serialVersionUID = -7801407214303725321L;

    /**
     *
     * @return
     */
    public Long count() {
        return getDelegate().count();
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    public List list(String field, String order, int init, int qtde) {
        return getDelegate().list(field, order, init, qtde);
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

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    public List list(String campo, String valor) {
        return getDelegate().list(campo, valor);
    }

}
