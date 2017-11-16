package <%= package.lower %>.<%= project.lower %>.security;

import java.io.Serializable;
import java.util.Objects;

public class Credentials implements Serializable {

    private String username;
    private String password;
    private String fingerprint;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
    
    @Override
    public int hashCode() {
        int hash = 3;
        hash = 53 * hash + Objects.hashCode(this.username);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Credentials other = (Credentials) obj;
        return Objects.equals(this.username, other.username);
    }

    @Override
    public String toString() {
        return "Credentials{" + "username=" + username + ", password=" + password + '}';
    }

}
