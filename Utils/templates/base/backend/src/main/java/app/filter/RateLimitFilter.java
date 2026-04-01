package <%= package.lower %>.<%= project.lower %>.filter;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

@Provider
@Priority(Priorities.USER)
public class RateLimitFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(RateLimitFilter.class.getName());

    /**
     * Maximum number of requests per minute per IP.
     * Configurable via system property or environment variable: app.ratelimit.requests-per-minute
     */
    private static final int DEFAULT_REQUESTS_PER_MINUTE = 60;

    private final ConcurrentHashMap<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String clientIp = extractClientIp(requestContext);
        int limit = getRequestsPerMinuteLimit();

        RateLimitEntry entry = requestCounts.compute(clientIp, (key, existing) -> {
            long now = System.currentTimeMillis();
            if (existing == null || now - existing.windowStart > 60_000) {
                return new RateLimitEntry(now, new AtomicInteger(1));
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        if (entry.counter.get() > limit) {
            long elapsed = System.currentTimeMillis() - entry.windowStart;
            long retryAfterSeconds = Math.max(1, (60_000 - elapsed) / 1000);

            LOG.log(Level.WARNING, "Rate limit exceeded for IP: {0}", clientIp);

            requestContext.abortWith(
                    Response.status(429)
                            .header("Retry-After", String.valueOf(retryAfterSeconds))
                            .entity("{\"error\":\"Too Many Requests\",\"retryAfter\":" + retryAfterSeconds + "}")
                            .build());
        }
    }

    private String extractClientIp(ContainerRequestContext requestContext) {
        String forwarded = requestContext.getHeaderString("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = requestContext.getHeaderString("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp.trim();
        }
        // Fallback — in a servlet environment the actual remote address
        // would come from HttpServletRequest; here we use a default.
        return "unknown";
    }

    private int getRequestsPerMinuteLimit() {
        String value = System.getProperty("app.ratelimit.requests-per-minute");
        if (value == null) {
            value = System.getenv("APP_RATELIMIT_REQUESTS_PER_MINUTE");
        }
        if (value != null) {
            try {
                return Integer.parseInt(value.trim());
            } catch (NumberFormatException e) {
                LOG.log(Level.WARNING, "Invalid rate limit value: {0}, using default", value);
            }
        }
        return DEFAULT_REQUESTS_PER_MINUTE;
    }

    /**
     * Holds the request count and window start time for a single IP.
     */
    private static class RateLimitEntry {
        final long windowStart;
        final AtomicInteger counter;

        RateLimitEntry(long windowStart, AtomicInteger counter) {
            this.windowStart = windowStart;
            this.counter = counter;
        }
    }
}
