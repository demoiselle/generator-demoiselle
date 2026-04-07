package <%= package.lower %>.<%= project.lower %>.email;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Utility class that builds HTML email bodies for confirmation and password reset emails.
 */
@ApplicationScoped
public class EmailTemplate {

    private static final String APP_NAME = "<%= project.capital %>";

    /**
     * Build the HTML body for an account-confirmation email.
     *
     * @param userName    the user's display name
     * @param confirmUrl  the full URL the user must visit to confirm their email
     * @return HTML string
     */
    public String confirmationEmail(String userName, String confirmUrl) {
        return wrapHtml(
            "<h2>Bem-vindo ao " + APP_NAME + "!</h2>"
            + "<p>Olá " + escapeHtml(userName) + ",</p>"
            + "<p>Obrigado por se registrar. Para ativar sua conta, clique no botão abaixo:</p>"
            + "<p style=\"text-align:center;margin:30px 0;\">"
            + "  <a href=\"" + escapeHtml(confirmUrl) + "\" "
            + "     style=\"background-color:#4CAF50;color:#ffffff;padding:12px 24px;"
            + "            text-decoration:none;border-radius:4px;font-size:16px;\">"
            + "    Confirmar Email"
            + "  </a>"
            + "</p>"
            + "<p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>"
            + "<p><a href=\"" + escapeHtml(confirmUrl) + "\">" + escapeHtml(confirmUrl) + "</a></p>"
            + "<p>Se você não criou esta conta, ignore este email.</p>"
        );
    }

    /**
     * Build the HTML body for a password-reset email.
     *
     * @param userName  the user's display name
     * @param resetUrl  the full URL the user must visit to reset their password
     * @return HTML string
     */
    public String resetPasswordEmail(String userName, String resetUrl) {
        return wrapHtml(
            "<h2>" + APP_NAME + " - Redefinição de Senha</h2>"
            + "<p>Olá " + escapeHtml(userName) + ",</p>"
            + "<p>Recebemos uma solicitação para redefinir sua senha. "
            + "Clique no botão abaixo para criar uma nova senha:</p>"
            + "<p style=\"text-align:center;margin:30px 0;\">"
            + "  <a href=\"" + escapeHtml(resetUrl) + "\" "
            + "     style=\"background-color:#2196F3;color:#ffffff;padding:12px 24px;"
            + "            text-decoration:none;border-radius:4px;font-size:16px;\">"
            + "    Redefinir Senha"
            + "  </a>"
            + "</p>"
            + "<p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>"
            + "<p><a href=\"" + escapeHtml(resetUrl) + "\">" + escapeHtml(resetUrl) + "</a></p>"
            + "<p>Este link expira em 1 hora.</p>"
            + "<p>Se você não solicitou a redefinição de senha, ignore este email.</p>"
        );
    }

    /**
     * Build the HTML body for a notification email.
     *
     * @param title   the notification title
     * @param message the notification message
     * @return HTML string
     */
    public String notificationEmail(String title, String message) {
        return wrapHtml(
            "<h2>" + APP_NAME + " - " + escapeHtml(title) + "</h2>"
            + "<p>" + escapeHtml(message) + "</p>"
        );
    }

    /**
     * Wrap content in a basic responsive HTML email layout.
     */
    private String wrapHtml(String content) {
        return "<!DOCTYPE html>"
            + "<html><head><meta charset=\"UTF-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"/>"
            + "</head><body style=\"margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"
            + "background-color:#f4f4f4;\">"
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
            + "<tr><td align=\"center\" style=\"padding:20px;\">"
            + "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" "
            + "style=\"background-color:#ffffff;border-radius:8px;padding:30px;\">"
            + "<tr><td>" + content + "</td></tr>"
            + "<tr><td style=\"padding-top:20px;border-top:1px solid #eeeeee;"
            + "margin-top:20px;font-size:12px;color:#999999;text-align:center;\">"
            + "<p>" + APP_NAME + " &copy; " + java.time.Year.now().getValue() + "</p>"
            + "</td></tr></table></td></tr></table></body></html>";
    }

    /**
     * Basic HTML escaping to prevent XSS in email content.
     */
    private String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
