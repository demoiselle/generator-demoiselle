package app.persistence;

import app.core.RESTCrud;
import app.entity.<%=name%>;
import br.gov.frameworkdemoiselle.stereotype.PersistenceController;
import br.gov.frameworkdemoiselle.template.JPACrud;
import java.util.List;

/**
 *
 * @author 70744416353
 */
@PersistenceController
public class <%=name%>DAO extends RESTCrud<<%=name%>, Long> {

}
