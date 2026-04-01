package <%= package.lower %>.<%= project.lower %>.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(JwtAuthFilter.class.getName());
    private static final String BEARER_PREFIX = "Bearer ";

    @Inject
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();

        // Skip authentication for public endpoints
        if (isPublicPath(path)) {
            return;
        }

        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            // No token present — let the resource decide if auth is required
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();

        try {
            Claims claims = jwtTokenProvider.validateToken(token);
            String userId = claims.getSubject();
            String email = (String) claims.get("email");
            String name = (String) claims.get("name");
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");

            requestContext.setSecurityContext(new SecurityContext() {
                @Override
                public Principal getUserPrincipal() {
                    return () -> userId;
                }

                @Override
                public boolean isUserInRole(String role) {
                    return roles != null && roles.contains(role);
                }

                @Override
                public boolean isSecure() {
                    return requestContext.getSecurityContext().isSecure();
                }

                @Override
                public String getAuthenticationScheme() {
                    return "Bearer";
                }
            });

            // Store claims in request context for downstream use
            requestContext.setProperty("jwt.claims", claims);
            requestContext.setProperty("jwt.userId", userId);
            requestContext.setProperty("jwt.email", email);
            requestContext.setProperty("jwt.name", name);
            requestContext.setProperty("jwt.roles", roles);

        } catch (ExpiredJwtException e) {
            LOG.log(Level.WARNING, "Expired JWT token");
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("{\"error\":\"Token expired\"}")
                            .build());
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Invalid JWT token: {0}", e.getMessage());
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("{\"error\":\"Invalid token\"}")
                            .build());
        }
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("auth/login")
                || path.startsWith("auth/register")
                || path.startsWith("auth/confirm")
                || path.startsWith("auth/forgot-password")
                || path.startsWith("auth/reset-password")
                || path.startsWith("health");
    }
}
