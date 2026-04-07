package <%= package.lower %>.<%= project.lower %>.email;

import <%= package.lower %>.<%= project.lower %>.entity.User;

import jakarta.annotation.Resource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service for sending emails via Jakarta Mail.
 */
@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class.getName());

    private static final String APP_NAME = "<%= project.capital %>";
    private static final String BASE_URL = "http://localhost:8080/<%= project.lower %>/api/v1";
    private static final String FROM_ADDRESS = "noreply@<%= project.lower %>.com";

    @Inject
    private EmailTemplate emailTemplate;

    @Resource(name = "java:jboss/mail/Default")
    private Session mailSession;

    /**
     * Send a confirmation email to the newly registered user.
     *
     * @param user the user who just registered (must have verificationToken set)
     */
    public void sendConfirmationEmail(User user) {
        String confirmUrl = BASE_URL + "/auth/confirm/" + user.getVerificationToken();
        String subject = APP_NAME + " - Confirme seu email";
        String body = emailTemplate.confirmationEmail(user.getDescription(), confirmUrl);

        send(user.getEmail(), subject, body);
    }

    /**
     * Send a password-reset email to the user.
     *
     * @param user the user who requested a password reset (must have resetToken set)
     */
    public void sendResetPasswordEmail(User user) {
        String resetUrl = BASE_URL + "/auth/reset-password?token=" + user.getResetToken();
        String subject = APP_NAME + " - Redefinição de senha";
        String body = emailTemplate.resetPasswordEmail(user.getDescription(), resetUrl);

        send(user.getEmail(), subject, body);
    }

    /**
     * Send a notification email to the given address.
     *
     * @param to      recipient email address
     * @param title   notification title
     * @param message notification message body
     */
    public void sendNotificationEmail(String to, String title, String message) {
        String subject = APP_NAME + " - " + title;
        String body = emailTemplate.notificationEmail(title, message);

        send(to, subject, body);
    }

    /**
     * Send an HTML email to the given address.
     */
    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = new MimeMessage(mailSession);
            message.setFrom(new InternetAddress(FROM_ADDRESS));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setContent(htmlBody, "text/html; charset=UTF-8");

            Transport.send(message);

            LOG.log(Level.INFO, "Email sent to {0}: {1}", new Object[]{to, subject});
        } catch (MessagingException e) {
            LOG.log(Level.SEVERE, "Failed to send email to " + to, e);
        }
    }
}
