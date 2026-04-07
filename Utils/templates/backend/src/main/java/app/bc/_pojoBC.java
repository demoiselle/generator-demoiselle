package <%= package.lower %>.<%= project.lower %>.bc;

import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import java.util.UUID;
import org.demoiselle.jee.crud.AbstractBusiness;
<% if (typeof packages !== 'undefined' && packages.includes('observability')) { %>
import org.demoiselle.jee.observability.annotation.Counted;
<% } %>

<% if (typeof packages !== 'undefined' && packages.includes('observability')) { %>
@Counted
<% } %>
public class <%= name.capital %>BC extends AbstractBusiness< <%= name.capital %>, UUID> {

}
