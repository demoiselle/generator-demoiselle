package <%= package.lower %>.<%= project.lower %>.fcm;

/**
 *
 * @author paulo
 */
public class WebData {

    private String event;
    private String data;

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

}
