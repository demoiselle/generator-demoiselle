package <%= package.lower %>.<%= project.lower %>.service;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Tag(name = "Health")
@Path("health")
@Produces(APPLICATION_JSON)
public class HealthREST {

    private static final Logger LOG = Logger.getLogger(HealthREST.class.getName());

    @Inject
    private EntityManager entityManager;

    @GET
    @Operation(summary = "Application health check (no authentication required)")
    public Response health() {
        Map<String, Object> result = new LinkedHashMap<>();
        boolean healthy = true;

        // Database check
        String dbStatus;
        try {
            dbStatus = (entityManager != null && entityManager.isOpen()) ? "UP" : "DOWN";
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Database health check failed: {0}", e.getMessage());
            dbStatus = "DOWN";
        }
        if ("DOWN".equals(dbStatus)) {
            healthy = false;
        }

        // Memory info
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        Map<String, Long> memory = new LinkedHashMap<>();
        memory.put("used", usedMemory);
        memory.put("max", maxMemory);
        memory.put("free", freeMemory);

        result.put("status", healthy ? "UP" : "DOWN");
        result.put("database", dbStatus);
        result.put("memory", memory);
        result.put("timestamp", Instant.now().toString());

        Response.Status httpStatus = healthy ? Response.Status.OK : Response.Status.SERVICE_UNAVAILABLE;
        return Response.status(httpStatus).entity(result).build();
    }
}
