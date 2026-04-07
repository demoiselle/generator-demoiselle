package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.User;
import <%= package.lower %>.<%= project.lower %>.security.Credentials;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

import java.util.List;
import java.util.logging.Logger;

import org.demoiselle.jee.crud.AbstractDAO;

public class UserDAO extends AbstractDAO<User, String> {

    private static final Logger LOG = Logger.getLogger(UserDAO.class.getName());

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public User findByEmail(String email) {
        CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> from = query.from(User.class);
        TypedQuery<User> typedQuery = getEntityManager().createQuery(
                query.select(from)
                        .where(builder.equal(from.get("email"), email))
        );
        List<User> results = typedQuery.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public User findByVerificationToken(String token) {
        CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> from = query.from(User.class);
        TypedQuery<User> typedQuery = getEntityManager().createQuery(
                query.select(from)
                        .where(builder.equal(from.get("verificationToken"), token))
        );
        List<User> results = typedQuery.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public User findByResetToken(String token) {
        CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<User> query = builder.createQuery(User.class);
        Root<User> from = query.from(User.class);
        TypedQuery<User> typedQuery = getEntityManager().createQuery(
                query.select(from)
                        .where(builder.equal(from.get("resetToken"), token))
        );
        List<User> results = typedQuery.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }
}
