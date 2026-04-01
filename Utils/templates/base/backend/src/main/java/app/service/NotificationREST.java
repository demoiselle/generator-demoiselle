package <%= package.lower %>.<%= project.lower %>.service;

import <%= package.lower %>.<%= project.lower %>.bc.NotificationBC;
import <%= package.lower %>.<%= project.lower %>.dao.NotificationDAO;
import <%= package.lower %>.<%= project.lower %>.entity.Notification;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import static jakarta.ws.rs.core.MediaType.APPLICATION_JSON;
import jakarta.ws.rs.core.Response;
import static jakarta.ws.rs.core.Response.ok;
import static jakarta.ws.rs.core.Response.status;

import java.util.List;
import java.util.logging.Logger;

import io.jsonwebtoken.Claims;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Tag(name = "Notifications")
@Path("notifications")
@Produces(APPLICATION_JSON)
@Consumes(APPLICATION_JSON)
public class NotificationREST {

    private static final Logger LOG = Logger.getLogger(NotificationREST.class.getName());

    @Inject
    private NotificationDAO notificationDAO;

    @Inject
    private NotificationBC notificationBC;

    @GET
    @Operation(summary = "Get notifications for the authenticated user")
    public Response find(
            @Context ContainerRequestContext requestContext,
            @QueryParam("read") Boolean read,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {

        Claims claims = (Claims) requestContext.getProperty("jwt.claims");
        if (claims == null) {
            return status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Authentication required\"}")
                    .build();
        }

        String userId = claims.getSubject();
        List<Notification> notifications = notificationDAO.findByUserIdPaginated(userId, read, page, size);
        long unreadCount = notificationDAO.countByUserIdAndRead(userId, false);

        return ok().entity(new NotificationListResponse(notifications, unreadCount)).build();
    }

    @PUT
    @Path("{id}/read")
    @Transactional
    @Operation(summary = "Mark a notification as read")
    public Response markAsRead(
            @Context ContainerRequestContext requestContext,
            @PathParam("id") Long id) {

        Claims claims = (Claims) requestContext.getProperty("jwt.claims");
        if (claims == null) {
            return status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Authentication required\"}")
                    .build();
        }

        String userId = claims.getSubject();
        Notification notification = notificationDAO.find(id);

        if (notification == null) {
            return status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Notification not found\"}")
                    .build();
        }

        if (!notification.getUserId().equals(userId)) {
            return status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}")
                    .build();
        }

        notification.setRead(true);
        notificationDAO.mergeFull(notification);

        return ok().entity(notification).build();
    }

    @POST
    @Transactional
    @RolesAllowed("ADMIN")
    @Operation(summary = "Create a new notification (ADMIN only)")
    public Response create(Notification notification) {
        if (notification.getUserId() == null || notification.getTitle() == null
                || notification.getMessage() == null) {
            return status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"userId, title and message are required\"}")
                    .build();
        }

        Notification created = notificationBC.send(notification);

        return status(Response.Status.CREATED).entity(created).build();
    }

    /**
     * Response wrapper that includes the notification list and unread count.
     */
    public static class NotificationListResponse {
        private List<Notification> notifications;
        private long unreadCount;

        public NotificationListResponse() {
        }

        public NotificationListResponse(List<Notification> notifications, long unreadCount) {
            this.notifications = notifications;
            this.unreadCount = unreadCount;
        }

        public List<Notification> getNotifications() {
            return notifications;
        }

        public void setNotifications(List<Notification> notifications) {
            this.notifications = notifications;
        }

        public long getUnreadCount() {
            return unreadCount;
        }

        public void setUnreadCount(long unreadCount) {
            this.unreadCount = unreadCount;
        }
    }
}
