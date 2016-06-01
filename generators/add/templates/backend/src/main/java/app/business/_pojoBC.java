package app.business;

import app.core.AbstractBC;
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
public class <%=name%>BC extends AbstractBC<<%=name%>, Long, <%=name%>DAO> {

}
