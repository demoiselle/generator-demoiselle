package app.service;

import app.entity.Todo;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import javax.transaction.Transactional;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.persistence.crud.AbstractREST;
import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RequiredRole;

/**
 * Todo REST
 *
 * @author Demoiselle Generator
 */
@Api("Todo")
@Path("todo")
@Authenticated
public class TodoREST extends AbstractREST<Todo, String> {

    @GET
    @Override
    @Transactional
    @RequiredRole("Administrador")
    @ApiOperation(value = "list all entities with pagination filter and query")
    public Result find() {
        if (uriInfo.getQueryParameters().isEmpty()) {
            return bc.find();
        } else {
            return bc.find(uriInfo.getQueryParameters());
        }
    }

}
