package <%= package.lower %>.<%= project.lower %>.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_log")
public class AuditLog implements Serializable {

    public enum AuditAction {
        CREATE, UPDATE, DELETE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name", nullable = false, length = 255)
    private String entityName;

    @Column(name = "entity_id", nullable = false, length = 255)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AuditAction action;

    @Column(name = "user_id", length = 255)
    private String userId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String changes;

    public AuditLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getChanges() {
        return changes;
    }

    public void setChanges(String changes) {
        this.changes = changes;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(this.id);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        final AuditLog other = (AuditLog) obj;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public String toString() {
        return "AuditLog{" + "id=" + id + ", entityName=" + entityName
                + ", entityId=" + entityId + ", action=" + action
                + ", userId=" + userId + ", timestamp=" + timestamp + '}';
    }
}
