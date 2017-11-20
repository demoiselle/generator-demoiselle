package <%= package.lower %>.<%= project.lower %>.fcm;

/**
 *
 * @author paulo
 */
public class WebMessage {

    private WebNotification notification;
    private WebData data;
    private String priority;
    private String to;
    private Boolean content_available;

    /**
     *
     * @return
     */
    public WebNotification getNotification() {
        return notification;
    }

    /**
     *
     * @param notification
     */
    public void setNotification(WebNotification notification) {
        this.notification = notification;
    }

    /**
     *
     * @return
     */
    public String getTo() {
        return to;
    }

    /**
     *
     * @param to
     */
    public void setTo(String to) {
        this.to = to;
    }

    /**
     *
     * @return
     */
    public String getPriority() {
        return priority;
    }

    /**
     *
     * @param priority
     */
    public void setPriority(String priority) {
        this.priority = priority;
    }

    public WebData getData() {
        return data;
    }

    public void setData(WebData data) {
        this.data = data;
    }

    public Boolean getContent_available() {
        return content_available;
    }

    public void setContent_available(Boolean content_available) {
        this.content_available = content_available;
    }

}
