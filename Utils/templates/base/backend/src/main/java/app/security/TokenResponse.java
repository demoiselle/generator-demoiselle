package <%= package.lower %>.<%= project.lower %>.security;

import java.io.Serializable;

public class TokenResponse implements Serializable {

    private String token;
    private long expiresIn;

    public TokenResponse() {
    }

    public TokenResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
