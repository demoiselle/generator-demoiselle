package <%= package.lower %>.<%= project.lower %>.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import jakarta.persistence.Basic;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.demoiselle.jee.crud.annotation.CreatedAt;
import org.demoiselle.jee.crud.annotation.UpdatedAt;
import org.demoiselle.jee.crud.annotation.CreatedBy;
import org.demoiselle.jee.crud.annotation.UpdatedBy;
import org.demoiselle.jee.crud.annotation.SoftDeletable;
<% if (typeof packages !== 'undefined' && packages.includes('audit')) { %>
import org.demoiselle.jee.crud.audit.AuditEntityListener;
<% } %>

@Entity
@Cacheable
@DynamicInsert
@DynamicUpdate
@SoftDeletable(field = "deletedAt")
<% if (typeof packages !== 'undefined' && packages.includes('audit')) { %>
@EntityListeners(AuditEntityListener.class)
<% } %>
@Table(name = "<%= name.lower %>")
public class <%= name.capital %> implements Serializable {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(unique = true)
    private UUID id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 128)
    @Column(nullable = false, length = 128)
    private String description;

    @CreatedAt
    private LocalDateTime createdAt;

    @UpdatedAt
    private LocalDateTime updatedAt;

    @CreatedBy
    private String createdBy;

    @UpdatedBy
    private String updatedBy;

    private LocalDateTime deletedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 17 * hash + Objects.hashCode(this.id);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final <%= name.capital %> other = (<%= name.capital %>) obj;
        return Objects.equals(this.id, other.id);
    }

    @Override
    public String toString() {
        return "<%= name.capital %>{" + "id=" + id + ", description=" + description + '}';
    }
}
