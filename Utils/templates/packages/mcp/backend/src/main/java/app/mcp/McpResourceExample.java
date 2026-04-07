package <%= package.lower %>.<%= project.lower %>.mcp;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import org.demoiselle.jee.mcp.annotation.McpResource;

/**
 * Example MCP resources for the <%= project.capital %> application.
 *
 * <p>Methods annotated with {@code @McpResource} expose application data
 * as readable resources via the Model Context Protocol.</p>
 */
@ApplicationScoped
public class McpResourceExample {

    @Inject
    private EntityManager em;

    @McpResource(
            uri = "app:///<%= project.lower %>/info",
            name = "application-info",
            description = "General information about the <%= project.capital %> application",
            mimeType = "application/json")
    public String applicationInfo() {
        return String.format(
                "{\"name\":\"%s\",\"version\":\"1.0.0\",\"framework\":\"Demoiselle 4.1\"}",
                "<%= project.capital %>");
    }

    @McpResource(
            uri = "app:///<%= project.lower %>/schema",
            name = "database-schema",
            description = "Lists all JPA entity names managed by the application",
            mimeType = "application/json")
    public String databaseSchema() {
        var entities = em.getMetamodel().getEntities();
        var sb = new StringBuilder("[");
        var first = true;
        for (var entity : entities) {
            if (!first) sb.append(",");
            sb.append("\"").append(entity.getName()).append("\"");
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }
}
