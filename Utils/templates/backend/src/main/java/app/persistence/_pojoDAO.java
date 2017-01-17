package app.persistence;

import app.core.RESTCrud;
import app.entity.<%= name.capital %>;
import br.gov.frameworkdemoiselle.stereotype.PersistenceController;
import br.gov.frameworkdemoiselle.template.JPACrud;
import java.util.List;

/**
 * <%= name.capital %> Persistence Controller
 *
 * @author demoiselle-generator
 */
@PersistenceController
public class <%= name.capital %>DAO extends RESTCrud<<%= name.capital %>, Long> {

}
