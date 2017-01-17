package app.service;

import app.core.AbstractREST;
import app.entity.<%= name.capital %>;
import app.persistence.<%= name.capital %>DAO;
import io.swagger.annotations.Api;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 * <%= name.capital %> REST
 *
 * @author demoiselle-generator
 */
@Api(value = "<%= name.kebab %>")
@Path("<%= name.kebab %>")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
public class <%= name.capital %>REST extends AbstractREST<<%= name.capital %>, Long, <%= name.capital %>DAO> {

}
