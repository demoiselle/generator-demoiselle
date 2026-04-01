package <%= package.lower %>.<%= project.lower %>.listener;

import <%= package.lower %>.<%= project.lower %>.dao.AuditLogDAO;
import <%= package.lower %>.<%= project.lower %>.entity.AuditLog;
import <%= package.lower %>.<%= project.lower %>.entity.AuditLog.AuditAction;

import jakarta.inject.Inject;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * JPA EntityListener that automatically records audit log entries
 * for create, update and delete operations on entities.
 */
public class AuditEntityListener {

    private static final Logger LOG = Logger.getLogger(AuditEntityListener.class.getName());

    @Inject
    private AuditLogDAO auditLogDAO;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @PrePersist
    public void onPrePersist(Object entity) {
        createAuditLog(entity, AuditAction.CREATE);
    }

    @PreUpdate
    public void onPreUpdate(Object entity) {
        createAuditLog(entity, AuditAction.UPDATE);
    }

    @PreRemove
    public void onPreRemove(Object entity) {
        createAuditLog(entity, AuditAction.DELETE);
    }

    private void createAuditLog(Object entity, AuditAction action) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityName(entity.getClass().getSimpleName());
            auditLog.setEntityId(extractEntityId(entity));
            auditLog.setAction(action);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setChanges(serializeEntity(entity));

            auditLogDAO.persist(auditLog);
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to create audit log for entity: "
                    + entity.getClass().getSimpleName(), e);
        }
    }

    private String extractEntityId(Object entity) {
        try {
            Field idField = findIdField(entity.getClass());
            if (idField != null) {
                idField.setAccessible(true);
                Object idValue = idField.get(entity);
                return idValue != null ? idValue.toString() : "null";
            }
        } catch (Exception e) {
            LOG.log(Level.FINE, "Could not extract entity ID", e);
        }
        return "unknown";
    }

    private Field findIdField(Class<?> clazz) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            for (Field field : current.getDeclaredFields()) {
                if (field.isAnnotationPresent(jakarta.persistence.Id.class)) {
                    return field;
                }
            }
            current = current.getSuperclass();
        }
        return null;
    }

    private String serializeEntity(Object entity) {
        try {
            Map<String, Object> fields = new LinkedHashMap<>();
            for (Field field : entity.getClass().getDeclaredFields()) {
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers())) {
                    continue;
                }
                field.setAccessible(true);
                Object value = field.get(entity);
                fields.put(field.getName(), value != null ? value.toString() : null);
            }
            return MAPPER.writeValueAsString(fields);
        } catch (Exception e) {
            LOG.log(Level.FINE, "Could not serialize entity for audit", e);
            return "{}";
        }
    }
}
