package app.business;

import app.entity.<%=name%>;
import app.persistence.<%=name%>DAO;
import br.gov.frameworkdemoiselle.stereotype.BusinessController;
import br.gov.frameworkdemoiselle.template.DelegateCrud;
import java.util.List;
/**
 *
 * @author 70744416353
 */
@BusinessController
public class <%=name%>BC extends DelegateCrud<<%=name%>, Long, <%=name%>DAO> {

    private static final long serialVersionUID = -7801407214303725321L;

    /**
     *
     * @return
     */
    public Long count() {
        return getDelegate().count();
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    public List list(String field, String order, int init, int qtde) {
        return getDelegate().list(field, order, init, qtde);
    }

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    public List list(String campo, String valor) {
        return getDelegate().list(campo, valor);
    }

}
