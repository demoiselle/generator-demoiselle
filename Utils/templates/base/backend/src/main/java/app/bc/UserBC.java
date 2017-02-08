package <%= package.lower %>.<%= project.lower %>.bc;

import <%= package.lower %>.<%= project.lower %>.entity.User;
import org.demoiselle.jee.crud.AbstractBusiness;

public class UserBC extends AbstractBusiness<User, String> {

}
