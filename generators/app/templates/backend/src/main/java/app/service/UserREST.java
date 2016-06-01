/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.service;

import app.core.AbstractREST;
import app.entity.User;
import app.persistence.UserDAO;
import io.swagger.annotations.Api;
import java.util.logging.Logger;
import javax.ws.rs.Consumes;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

/**
 *
 * @author 70744416353
 */
@Api(value = "user")
@Path("user")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
public class UserREST extends AbstractREST<User, Long, UserDAO> {

}
