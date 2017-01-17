package app.business;

import app.core.AbstractBC;
import app.entity.<%= name.capital %>;
import app.persistence.<%= name.capital %>DAO;
import br.gov.frameworkdemoiselle.stereotype.BusinessController;
import br.gov.frameworkdemoiselle.template.DelegateCrud;
import java.util.List;

/**
 * <%= name.capital %> Business Controller
 *
 * @author demoiselle-generator
 */
@BusinessController
public class <%= name.capital %>BC extends AbstractBC<<%= name.capital %>, Long, <%= name.capital %>DAO> {

}
