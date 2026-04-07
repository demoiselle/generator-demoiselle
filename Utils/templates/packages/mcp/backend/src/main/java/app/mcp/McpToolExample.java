package <%= package.lower %>.<%= project.lower %>.mcp;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import org.demoiselle.jee.mcp.annotation.McpParam;
import org.demoiselle.jee.mcp.annotation.McpTool;

/**
 * Example MCP tools for the <%= project.capital %> application.
 *
 * <p>Methods annotated with {@code @McpTool} are automatically discovered
 * and registered by the Demoiselle MCP module.</p>
 */
@ApplicationScoped
public class McpToolExample {

    @Inject
    private EntityManager em;

    @McpTool(description = "Returns a greeting message for the given name")
    public String greet(
            @McpParam(description = "Name of the person to greet") String name) {
        return "Hello, " + name + "! Welcome to <%= project.capital %>.";
    }

    @McpTool(name = "countEntities", description = "Counts the total number of records for a given entity")
    public long countEntities(
            @McpParam(description = "Simple name of the JPA entity class") String entityName) {
        return (long) em.createQuery("SELECT COUNT(e) FROM " + entityName + " e")
                .getSingleResult();
    }

    @McpTool(description = "Returns the current server status and uptime information")
    public String serverStatus() {
        long uptimeMs = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
        long uptimeSec = uptimeMs / 1000;
        return String.format("{\"status\":\"UP\",\"uptimeSeconds\":%d}", uptimeSec);
    }
}
