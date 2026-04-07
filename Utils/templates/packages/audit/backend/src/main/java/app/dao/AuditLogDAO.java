package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.AuditLog;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

import org.demoiselle.jee.crud.AbstractDAO;

public class AuditLogDAO extends AbstractDAO<AuditLog, Long> {

    private static final Logger LOG = Logger.getLogger(AuditLogDAO.class.getName());

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    public List<AuditLog> findByEntityName(String entityName) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<AuditLog> cq = cb.createQuery(AuditLog.class);
        Root<AuditLog> root = cq.from(AuditLog.class);
        cq.select(root).where(cb.equal(root.get("entityName"), entityName));
        TypedQuery<AuditLog> query = getEntityManager().createQuery(cq);
        return query.getResultList();
    }

    public List<AuditLog> findByUserId(String userId) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<AuditLog> cq = cb.createQuery(AuditLog.class);
        Root<AuditLog> root = cq.from(AuditLog.class);
        cq.select(root).where(cb.equal(root.get("userId"), userId));
        TypedQuery<AuditLog> query = getEntityManager().createQuery(cq);
        return query.getResultList();
    }

    public List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<AuditLog> cq = cb.createQuery(AuditLog.class);
        Root<AuditLog> root = cq.from(AuditLog.class);
        cq.select(root).where(cb.between(root.get("timestamp"), start, end));
        cq.orderBy(cb.desc(root.get("timestamp")));
        TypedQuery<AuditLog> query = getEntityManager().createQuery(cq);
        return query.getResultList();
    }
}
