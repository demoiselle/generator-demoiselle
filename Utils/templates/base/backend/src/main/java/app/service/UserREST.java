package <%= package.lower %>.service;

import <%= package.lower %>.entity.User;
import io.swagger.annotations.Api;
import javax.ws.rs.Path;
import org.demoiselle.jee.crud.AbstractREST;

@Api("User")
@Path("user")
public class UserREST extends AbstractREST<User, String> {

}
