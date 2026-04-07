package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.dao.UserDAO;
import <%= package.lower %>.<%= project.lower %>.entity.User;
import <%= package.lower %>.<%= project.lower %>.security.Credentials;

import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;
import static jakarta.ws.rs.core.Response.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.demoiselle.jee.core.api.security.DemoiselleUser;
import org.demoiselle.jee.core.api.security.SecurityContext;
import org.demoiselle.jee.core.api.security.Token;
import org.demoiselle.jee.core.api.security.TokenManager;
import org.demoiselle.jee.security.annotation.Authenticated;
import org.demoiselle.jee.security.annotation.RateLimit;
import org.demoiselle.jee.security.bruteforce.BruteForceGuard;
import org.demoiselle.jee.security.impl.DemoiselleUserImpl;
import org.demoiselle.jee.observability.annotation.Counted;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Tag(name = "Auth")
@Path("auth")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
@Counted
public class AuthREST {

    private static final Logger LOG = Logger.getLogger(AuthREST.class.getName());

    @Inject
    private UserDAO userDAO;

    @Inject
    private SecurityContext securityContext;

    @Inject
    private TokenManager tokenManager;

    @Inject
    private Token token;

    @Inject
    private DemoiselleUser loggedUser;

    @Inject
    private BruteForceGuard bruteForceGuard;

    @Inject
    private HttpServletRequest httpServletRequest;

    @POST
    @Path("login")
    @Transactional
    @RateLimit(requests = 20, window = 60)
    @Operation(summary = "Authenticate user and return JWT token")
    public Response login(Credentials credentials) {
        String ip = httpServletRequest.getRemoteAddr();

        int retryAfter = bruteForceGuard.isBlocked(ip);
        if (retryAfter > 0) {
            return status(429)
                    .header("Retry-After", retryAfter)
                    .entity("{\"error\":\"Too many failed attempts\"}")
                    .build();
        }

        User user = userDAO.findByEmail(credentials.getUsername());

        if (user == null || !org.mindrot.jbcrypt.BCrypt.checkpw(credentials.getPassword(), user.getPass())) {
            bruteForceGuard.recordFailedAttempt(ip);
            return status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid credentials\"}")
                    .build();
        }

        if (!user.isEmailVerified()) {
            return status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Email not verified\"}")
                    .build();
        }

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList());

        // Build DemoiselleUser and set via SecurityContext / TokenManager
        DemoiselleUserImpl demoiselleUser = new DemoiselleUserImpl();
        demoiselleUser.setIdentity(user.getId());
        demoiselleUser.setName(user.getDescription());
        demoiselleUser.addParam("email", user.getEmail());
        roles.forEach(demoiselleUser::addRole);

        securityContext.setUser(demoiselleUser);

        bruteForceGuard.resetAttempts(ip);

        return ok().entity("{\"token\":\"" + token.getKey() + "\"}").build();
    }

    @GET
    @Path("refresh")
    @Authenticated
    @Operation(summary = "Refresh JWT token")
    public Response refresh() {
        DemoiselleUser currentUser = securityContext.getUser();

        if (currentUser == null) {
            return status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"No valid token provided\"}")
                    .build();
        }

        // Re-set the user to generate a new token
        securityContext.setUser(currentUser);

        return ok().entity("{\"token\":\"" + token.getKey() + "\"}").build();
    }

    @POST
    @Path("register")
    @Transactional
    @Operation(summary = "Register a new user")
    public Response register(User newUser) {
        User existing = userDAO.findByEmail(newUser.getEmail());

        if (existing != null) {
            return status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email already registered\"}")
                    .build();
        }

        newUser.setPass(org.mindrot.jbcrypt.BCrypt.hashpw(newUser.getPass(), org.mindrot.jbcrypt.BCrypt.gensalt(12)));
        newUser.setEmailVerified(false);
        newUser.setVerificationToken(UUID.randomUUID().toString());

        userDAO.persist(newUser);

        LOG.log(Level.INFO, "User registered: {0}, verification token: {1}",
                new Object[]{newUser.getEmail(), newUser.getVerificationToken()});

        return status(Response.Status.CREATED)
                .entity("{\"message\":\"Registration successful. Please check your email to confirm your account.\"}")
                .build();
    }

    @POST
    @Path("confirm/{token}")
    @Transactional
    @Operation(summary = "Confirm user email with verification token")
    public Response confirmEmail(@PathParam("token") String verificationToken) {
        User user = userDAO.findByVerificationToken(verificationToken);

        if (user == null) {
            return status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid verification token\"}")
                    .build();
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userDAO.mergeFull(user);

        return ok().entity("{\"message\":\"Email confirmed successfully\"}").build();
    }

    @POST
    @Path("forgot-password")
    @Transactional
    @Operation(summary = "Request password reset email")
    public Response forgotPassword(Credentials credentials) {
        User user = userDAO.findByEmail(credentials.getUsername());

        if (user == null) {
            // Return OK even if user not found to prevent email enumeration
            return ok().entity("{\"message\":\"If the email exists, a reset link has been sent.\"}").build();
        }

        user.setResetToken(UUID.randomUUID().toString());
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userDAO.mergeFull(user);

        LOG.log(Level.INFO, "Password reset requested for: {0}, reset token: {1}",
                new Object[]{user.getEmail(), user.getResetToken()});

        return ok().entity("{\"message\":\"If the email exists, a reset link has been sent.\"}").build();
    }

    @POST
    @Path("reset-password")
    @Transactional
    @Operation(summary = "Reset password using reset token")
    public Response resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getNewPassword() == null) {
            return status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Token and new password are required\"}")
                    .build();
        }

        User user = userDAO.findByResetToken(request.getToken());

        if (user == null) {
            return status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid reset token\"}")
                    .build();
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Reset token has expired\"}")
                    .build();
        }

        user.setPass(org.mindrot.jbcrypt.BCrypt.hashpw(request.getNewPassword(), org.mindrot.jbcrypt.BCrypt.gensalt(12)));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userDAO.mergeFull(user);

        return ok().entity("{\"message\":\"Password reset successfully\"}").build();
    }

    /**
     * Inner DTO for reset password requests.
     */
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
