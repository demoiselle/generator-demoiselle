package <%= package.lower %>.<%= project.lower %>.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class JwtTokenProvider {

    private static final Logger LOG = Logger.getLogger(JwtTokenProvider.class.getName());

    private static final String SECRET = "<%= project.lower %>-jwt-secret-key-change-in-production-min-32-chars";
    private static final long EXPIRATION_MS = 3600000; // 1 hour
    private static final long REFRESH_EXPIRATION_MS = 86400000; // 24 hours

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String userId, String email, String name, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("name", name)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String refreshToken(Claims claims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .subject(claims.getSubject())
                .claim("email", claims.get("email"))
                .claim("name", claims.get("name"))
                .claim("roles", claims.get("roles"))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            LOG.log(Level.WARNING, "JWT token expired: {0}", e.getMessage());
            throw e;
        } catch (MalformedJwtException | SecurityException e) {
            LOG.log(Level.WARNING, "Invalid JWT token: {0}", e.getMessage());
            throw e;
        }
    }

    public long getExpirationMs() {
        return EXPIRATION_MS;
    }
}
