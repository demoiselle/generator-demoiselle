package <%= package.lower %>.<%= project.lower %>.filter;

import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Rate limiting filter per IP address.
 * Limits the number of requests per minute from a single IP.
 */
@Provider
public class RateLimitFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(RateLimitFilter.class.getName());

    @Inject
    @ConfigProperty(name = "app.ratelimit.max-requests", defaultValue = "100")
    private int maxRequestsPerMinute;

    private final Map<String, RateBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String clientIp = getClientIp(requestContext);
        RateBucket bucket = buckets.computeIfAbsent(clientIp, k -> new RateBucket());

        if (!bucket.tryConsume(maxRequestsPerMinute)) {
            LOG.log(Level.WARNING, "Rate limit exceeded for IP: {0}", clientIp);
            requestContext.abortWith(
                Response.status(Response.Status.TOO_MANY_REQUESTS)
                    .entity("{\"error\": \"Rate limit exceeded. Try again later.\"}")
                    .build()
            );
        }
    }

    private String getClientIp(ContainerRequestContext requestContext) {
        String forwarded = requestContext.getHeaderString("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        // Fallback — actual remote address not available via JAX-RS filter;
        // in production, rely on X-Forwarded-For from reverse proxy.
        return "unknown";
    }

    private static class RateBucket {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        boolean tryConsume(int maxRequests) {
            long now = System.currentTimeMillis();
            if (now - windowStart > 60_000) {
                count.set(0);
                windowStart = now;
            }
            return count.incrementAndGet() <= maxRequests;
        }
    }
}
