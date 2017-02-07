package <%= package.lower %>.service;

import <%= package.lower %>.entity.User;
import io.swagger.annotations.Api;
import javax.transaction.Transactional;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.crud.AbstractREST;

@Api("User")
@Path("user")
public class UserREST extends AbstractREST<User, String> {
    
    @GET
    @Override
    @Transactional
    public Result find() {
        return bc.find();
    }

}
