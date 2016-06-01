package app.persistence;

import app.core.RESTCrud;
import br.gov.frameworkdemoiselle.stereotype.PersistenceController;
import app.entity.User;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;

/**
 *
 * @author 70744416353
 */
@PersistenceController
public class UserDAO extends RESTCrud<User, Long> {

    /**
     *
     * @param telephoneNumber
     * @return
     */
    public User loadByFone(String telephoneNumber) {
        String jpql = "SELECT u from " + this.getBeanClass().getSimpleName() + " u where u.telephoneNumber = :telephoneNumber";

        TypedQuery<User> query = getEntityManager().createQuery(jpql, User.class);
        query.setParameter("telephoneNumber", telephoneNumber);

        User result;
        try {
            result = query.getSingleResult();
        } catch (NoResultException cause) {
            result = null;
            LOG.severe(cause.getMessage());
        }

        return result;
    }

    /**
     *
     * @param email
     * @param senha
     * @return
     */
    public User loadEmailPass(String email, String senha) {
        String jpql = "SELECT u from " + this.getBeanClass().getSimpleName() + " u where u.email = :email and u.senha = :senha";

        TypedQuery<User> query = getEntityManager().createQuery(jpql, User.class);
        query.setParameter("email", email);
        query.setParameter("senha", senha);

        User result;
        try {
            result = query.getSingleResult();
        } catch (NoResultException cause) {
            result = null;
            LOG.severe(cause.getMessage());
        }

        return result;
    }

}
