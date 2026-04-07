package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.Notification;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.List;
import java.util.logging.Logger;

import org.demoiselle.jee.crud.AbstractDAO;

public class NotificationDAO extends AbstractDAO<Notification, Long> {

    private static final Logger LOG = Logger.getLogger(NotificationDAO.class.getName());

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public List<Notification> findByUserId(String userId) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Notification> cq = cb.createQuery(Notification.class);
        Root<Notification> root = cq.from(Notification.class);
        cq.select(root).where(cb.equal(root.get("userId"), userId));
        cq.orderBy(cb.desc(root.get("createdAt")));
        TypedQuery<Notification> query = getEntityManager().createQuery(cq);
        return query.getResultList();
    }

    public List<Notification> findByUserIdAndRead(String userId, boolean read) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Notification> cq = cb.createQuery(Notification.class);
        Root<Notification> root = cq.from(Notification.class);
        Predicate userPredicate = cb.equal(root.get("userId"), userId);
        Predicate readPredicate = cb.equal(root.get("read"), read);
        cq.select(root).where(cb.and(userPredicate, readPredicate));
        cq.orderBy(cb.desc(root.get("createdAt")));
        TypedQuery<Notification> query = getEntityManager().createQuery(cq);
        return query.getResultList();
    }

    public long countByUserIdAndRead(String userId, boolean read) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<Notification> root = cq.from(Notification.class);
        Predicate userPredicate = cb.equal(root.get("userId"), userId);
        Predicate readPredicate = cb.equal(root.get("read"), read);
        cq.select(cb.count(root)).where(cb.and(userPredicate, readPredicate));
        TypedQuery<Long> query = getEntityManager().createQuery(cq);
        return query.getSingleResult();
    }

    public List<Notification> findByUserIdPaginated(String userId, Boolean readFilter, int page, int size) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Notification> cq = cb.createQuery(Notification.class);
        Root<Notification> root = cq.from(Notification.class);

        Predicate predicate = cb.equal(root.get("userId"), userId);
        if (readFilter != null) {
            predicate = cb.and(predicate, cb.equal(root.get("read"), readFilter));
        }

        cq.select(root).where(predicate);
        cq.orderBy(cb.desc(root.get("createdAt")));

        TypedQuery<Notification> query = getEntityManager().createQuery(cq);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }
}
