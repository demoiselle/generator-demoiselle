package <%= package.lower %>.<%= project.lower %>.entity;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.xml.bind.annotation.XmlRootElement;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicInsert
@DynamicUpdate
@XmlRootElement
@Table(name = "<%= name.lower %>")
public class <%= name.capital %> implements Serializable {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(unique = true)
    private String id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 128)
    @Column(nullable = false, length = 128)
    private String description;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
