/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.service;

import app.core.AbstractREST;
import app.entity.<%=name%>;
import app.persistence.<%=name%>DAO;
import io.swagger.annotations.Api;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 *
 * @author 70744416353
 */
@Api(value = "<%=name.toLowerCase()%>")
@Path("<%=name.toLowerCase()%>")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
public class <%=name%>REST extends AbstractREST<<%=name%>, Long, <%=name%>DAO> {

}
