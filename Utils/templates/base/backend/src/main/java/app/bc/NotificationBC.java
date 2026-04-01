package <%= package.lower %>.<%= project.lower %>.bc;

import <%= package.lower %>.<%= project.lower %>.dao.NotificationDAO;
import <%= package.lower %>.<%= project.lower %>.dao.UserDAO;
import <%= package.lower %>.<%= project.lower %>.email.EmailService;
import <%= package.lower %>.<%= project.lower %>.entity.Notification;
import <%= package.lower %>.<%= project.lower %>.entity.User;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Business controller for notifications.
 * Handles in-app persistence and optional email delivery.
 */
@ApplicationScoped
public class NotificationBC {

    private static final Logger LOG = Logger.getLogger(NotificationBC.class.getName());

    @Inject
    private NotificationDAO notificationDAO;

    @Inject
    private UserDAO userDAO;

    @Inject
    private EmailService emailService;

    @Inject
    @ConfigProperty(name = "app.notification.email.enabled", defaultValue = "false")
    private boolean emailNotificationEnabled;

    /**
     * Send a notification: persist in-app and optionally send via email.
     *
     * @param notification the notification to send (must have userId, title, message and type set)
     * @return the persisted notification
     */
    @Transactional
    public Notification send(Notification notification) {
        if (notification.getType() == null) {
            notification.setType(Notification.NotificationType.INFO);
        }
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        notification.setRead(false);

        // Persist in-app notification
        notificationDAO.persist(notification);

        LOG.log(Level.INFO, "Notification created for user {0}: {1}",
                new Object[]{notification.getUserId(), notification.getTitle()});

        // Send email notification if enabled
        if (emailNotificationEnabled) {
            sendEmailNotification(notification);
        }

        return notification;
    }

    private void sendEmailNotification(Notification notification) {
        try {
            User user = userDAO.find(notification.getUserId());
            if (user != null && user.getEmail() != null) {
                emailService.sendNotificationEmail(user.getEmail(),
                        notification.getTitle(), notification.getMessage());
                LOG.log(Level.INFO, "Email notification sent to {0}", user.getEmail());
            }
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to send email notification for user "
                    + notification.getUserId(), e);
        }
    }
}
