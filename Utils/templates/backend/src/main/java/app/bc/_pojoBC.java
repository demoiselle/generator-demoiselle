package <%= package.lower %>.<%= project.lower %>.bc;

import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import org.demoiselle.jee.crud.AbstractBusiness;

public class <%= name.capital %>BC extends AbstractBusiness< <%= name.capital %>, String> {

}
