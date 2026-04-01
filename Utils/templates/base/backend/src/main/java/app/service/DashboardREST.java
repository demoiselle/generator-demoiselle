package <%= package.lower %>.<%= project.lower %>.service;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Tag(name = "Dashboard")
@Path("dashboard")
@Produces(APPLICATION_JSON)
public class DashboardREST {

    private static final Logger LOG = Logger.getLogger(DashboardREST.class.getName());

    // ENTITY_STATS_INJECT

    @GET
    @Path("stats")
    @RolesAllowed({"ADMIN", "USER"})
    @Operation(summary = "Get dashboard statistics with entity counts")
    public Response stats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        try {
            // ENTITY_COUNT_INJECT
            stats.put("status", "OK");
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Error collecting dashboard stats: {0}", e.getMessage());
            stats.put("status", "PARTIAL");
            stats.put("error", e.getMessage());
        }

        return ok().entity(stats).build();
    }
}
