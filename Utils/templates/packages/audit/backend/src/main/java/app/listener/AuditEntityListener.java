package <%= package.lower %>.<%= project.lower %>.listener;

import <%= package.lower %>.<%= project.lower %>.dao.AuditLogDAO;
import <%= package.lower %>.<%= project.lower %>.entity.AuditLog;
import <%= package.lower %>.<%= project.lower %>.entity.AuditLog.AuditAction;

import jakarta.inject.Inject;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PreUpdate;

import java.time.LocalDateTime;
import java.util.logging.Level;
import java.util.logging.Logger;

public class AuditEntityListener {

    private static final Logger LOG = Logger.getLogger(AuditEntityListener.class.getName());

    @Inject
    private AuditLogDAO auditLogDAO;

    private Object previousState;

    @PreUpdate
    public void beforeUpdate(Object entity) {
        // Store reference for change tracking
        this.previousState = entity;
    }

    @PostPersist
    public void afterCreate(Object entity) {
        logAudit(entity, AuditAction.CREATE, null);
    }

    @PostUpdate
    public void afterUpdate(Object entity) {
        logAudit(entity, AuditAction.UPDATE, previousState);
    }

    @PostRemove
    public void afterDelete(Object entity) {
        logAudit(entity, AuditAction.DELETE, null);
    }

    private void logAudit(Object entity, AuditAction action, Object previous) {
        try {
            AuditLog log = new AuditLog();
            log.setEntityName(entity.getClass().getSimpleName());
            log.setEntityId(getEntityId(entity));
            log.setAction(action);
            log.setTimestamp(LocalDateTime.now());
            log.setChanges(buildChangesJson(entity, previous));

            auditLogDAO.create(log);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to create audit log entry", e);
        }
    }

    private String getEntityId(Object entity) {
        try {
            var idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object id = idField.get(entity);
            return id != null ? id.toString() : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String buildChangesJson(Object entity, Object previous) {
        if (previous == null) {
            return null;
        }
        try {
            return entity.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
