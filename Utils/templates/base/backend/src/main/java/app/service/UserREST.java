package app.service;

import app.entity.User;
import io.swagger.annotations.Api;
import javax.ws.rs.Path;
import org.demoiselle.jee.crud.AbstractREST;
import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RequiredRole;

/**
 *
 * @author gladson
 */
@Authenticated
@Api("User")
@Path("user")
@RequiredRole(value = "ADMINISTRADOR")
public class UserREST extends AbstractREST<User, String> {

}
