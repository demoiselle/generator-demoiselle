package app.exception.cors;

import java.util.Iterator;

import javax.validation.ConstraintViolation;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import app.exception.ConstraintViolationException;

import br.gov.frameworkdemoiselle.HttpViolationException;

/**
 *
 * @author 70744416353
 */
@Provider
public class ValidationCORSExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        HttpViolationException failed = new HttpViolationException(Response.Status.PRECONDITION_FAILED.getStatusCode());

        final ResponseBuilder response = Response.status(failed.getStatusCode());

        for (Iterator<ConstraintViolation<?>> iter = exception.getConstraintViolations().iterator(); iter.hasNext();) {
            ConstraintViolation<?> violation = iter.next();
            failed.addViolation(violation.getPropertyPath().toString(), violation.getMessage());
        }

        Object entity = failed.getViolations();

        response.header("Access-Control-Expose-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Credentials");
        response.header("Access-Control-Allow-Credentials", "true");
        response.header("Access-Control-Allow-Origin", "*");

        return response.entity(entity).type(MediaType.APPLICATION_JSON).build();
    }

}
