package app.exception.cors;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import app.exception.AppAuthorizationException;

/**
 *
 * @author 70744416353
 */
@Provider
public class AuthorizationCORSExceptionMapper implements ExceptionMapper<AppAuthorizationException> {

    @Override
    public Response toResponse(AppAuthorizationException exception) {

    	ResponseBuilder response = Response.status(Response.Status.FORBIDDEN).entity(exception.getCause());

    	response.header("Access-Control-Expose-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Credentials");
        response.header("Access-Control-Allow-Credentials", "true");
        response.header("Access-Control-Allow-Origin", "*");

        return response.build();
    }

}
