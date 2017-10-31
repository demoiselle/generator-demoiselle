package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import javax.transaction.Transactional;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import org.demoiselle.jee.core.api.crud.Result;
import org.demoiselle.jee.crud.AbstractREST;
import org.demoiselle.jee.crud.Search;
import org.demoiselle.jee.security.annotation.Authenticated;

@Api("v1/<%= name.capital %>s")
@ApiImplicitParams({
    @ApiImplicitParam(name = "Authorization", value = "JWT token",
            required = true, dataType = "string", paramType = "header")
})
@Path("v1/<%= name.lower %>s")
@Authenticated
public class <%= name.capital %>REST extends AbstractREST< <%= name.capital %>, String> {

    @GET
    @Override
    @Transactional
    @Search(fields = {"id", "description"}) // Escolha quais campos serão passados para o frontend
    public Result find() {
        return bc.find();
    }

}
