package app.service;

import app.entity.Todo;
import app.message.TodoMessage;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import java.util.logging.Logger;
import javax.ejb.Asynchronous;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Response;
import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.core.api.security.DemoiselleUser;
import org.demoiselle.jee.crud.AbstractREST;
import org.demoiselle.jee.crud.Search;
import org.demoiselle.jee.rest.annotation.CacheControl;
import org.demoiselle.jee.rest.exception.DemoiselleRestException;
import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RequiredRole;

/**
 *
 * @author gladson
 */
@Api("Todo")
@Path("todo")
@Authenticated
public class TodoREST extends AbstractREST<Todo, String> {

    @GET
    @Override
    @Transactional
    @Search(fields = {"id", "descricao"}) // Escolha quais campos serão passados para o frontend
    public Result find() {
        return bc.find();
    }

}
