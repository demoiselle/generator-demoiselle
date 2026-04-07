package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.dao.AuditLogDAO;
import <%= package.lower %>.<%= project.lower %>.entity.AuditLog;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.logging.Logger;

<% if (typeof packages !== 'undefined' && packages.includes('auth')) { %>
import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RequiredRole;
<% } %>
import org.demoiselle.jee.observability.annotation.Counted;
import org.demoiselle.jee.observability.annotation.Traced;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Tag(name = "Audit")
@Path("audit")
@Produces(APPLICATION_JSON)
<% if (typeof packages !== 'undefined' && packages.includes('auth')) { %>
@Authenticated
@RequiredRole({"ADMIN"})
<% } %>
@Counted
@Traced(module = "audit", operation = "query")
public class AuditREST {

    private static final Logger LOG = Logger.getLogger(AuditREST.class.getName());

    @Inject
    private AuditLogDAO auditLogDAO;

    @GET
    @Operation(summary = "Query audit log entries with optional filters")
    public Response find(
            @QueryParam("entityName") String entityName,
            @QueryParam("userId") String userId,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate) {

        List<AuditLog> results;

        if (startDate != null && endDate != null) {
            try {
                LocalDateTime start = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                LocalDateTime end = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                results = auditLogDAO.findByTimestampBetween(start, end);
            } catch (DateTimeParseException e) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Invalid date format. Use ISO format: yyyy-MM-ddTHH:mm:ss\"}")
                        .build();
            }
        } else if (entityName != null) {
            results = auditLogDAO.findByEntityName(entityName);
        } else if (userId != null) {
            results = auditLogDAO.findByUserId(userId);
        } else {
            results = auditLogDAO.findAll();
        }

        return ok().entity(results).build();
    }
}
