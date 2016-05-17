package app.persistence;

import br.gov.frameworkdemoiselle.stereotype.PersistenceController;
import br.gov.frameworkdemoiselle.template.JPACrud;
import app.entity.<%=name%>;
import java.util.List;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;


@PersistenceController
public class <%=name%>DAO extends JPACrud<<%=name%>, Long> {

    private static final long serialVersionUID = 1L;


    /**
     *
     * @return
     */
    public Long count() {
        return (Long) getEntityManager().createQuery("select COUNT(u) from " + this.getBeanClass().getSimpleName() + " u").getSingleResult();
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    @SuppressWarnings("unchecked")
    public List list(String field, String order, int init, int qtde) {
        return getEntityManager().createQuery("select u from " + this.getBeanClass().getSimpleName() + " u ORDER BY " + field + " " + order).setFirstResult(init).setMaxResults(qtde).getResultList();
    }

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    @SuppressWarnings("unchecked")
    public List list(String campo, String valor) {
        return getEntityManager().createQuery("select u from " + this.getBeanClass().getSimpleName() + " u " + " where " + campo + " = " + valor + " ORDER BY " + campo).getResultList();
    }

}
