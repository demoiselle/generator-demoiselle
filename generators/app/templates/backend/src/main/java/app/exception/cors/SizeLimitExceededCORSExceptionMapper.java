package app.exception.cors;

import javax.naming.SizeLimitExceededException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import static javax.servlet.http.HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE;

/**
 *
 * @author 70744416353
 */
@Provider
public class SizeLimitExceededCORSExceptionMapper implements ExceptionMapper<SizeLimitExceededException> {

    @Override
    public Response toResponse(SizeLimitExceededException exception) {
        return Response.status(SC_REQUEST_ENTITY_TOO_LARGE).entity(exception.getCause()).build();
    }

}
