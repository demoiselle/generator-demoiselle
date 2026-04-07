package <%= package.lower %>.<%= project.lower %>.mcp;

import jakarta.enterprise.context.ApplicationScoped;

import org.demoiselle.jee.mcp.annotation.McpParam;
import org.demoiselle.jee.mcp.annotation.McpPrompt;

/**
 * Example MCP prompts for the <%= project.capital %> application.
 *
 * <p>Methods annotated with {@code @McpPrompt} provide reusable prompt
 * templates that MCP clients can discover and invoke.</p>
 */
@ApplicationScoped
public class McpPromptExample {

    @McpPrompt(
            name = "explain-entity",
            description = "Generates a prompt asking the AI to explain a given entity and its relationships")
    public String explainEntity(
            @McpParam(description = "Name of the entity to explain") String entityName) {
        return "Explain the entity '" + entityName + "' in the <%= project.capital %> application. "
                + "Describe its fields, relationships, and purpose in the domain model.";
    }

    @McpPrompt(
            name = "generate-query",
            description = "Generates a prompt asking the AI to write a JPQL query for a given entity")
    public String generateQuery(
            @McpParam(description = "Name of the entity to query") String entityName,
            @McpParam(description = "Description of the desired query in natural language") String queryDescription) {
        return "Write a JPQL query for the entity '" + entityName + "' that: " + queryDescription + ". "
                + "Use the package <%= package.lower %>.<%= project.lower %>.entity.";
    }
}
