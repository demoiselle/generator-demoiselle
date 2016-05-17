package pgxp.entity;

import java.io.Serializable;
import java.security.Principal;
import javax.enterprise.context.RequestScoped;
import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 *
 * @author 70744416353
 */
@Entity
public class <%=name%> implements Principal, Serializable {

    private static final long serialVersionUID = 5625711959333905292L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 1)
    @Column(name = "descricao")
    private String descricao;

    /**
     *
     * @return
     */
    public Long getId() {
        return id;
    }

    /**
     *
     * @param id
     */
    public void setId(Long id) {
        this.id = id;
    }

    public String getDescricao() {
        return name;
    }

    /**
     *
     * @param Name
     */
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }


}
