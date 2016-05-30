package app.exception;

import br.gov.frameworkdemoiselle.security.AuthorizationException;

/**
 *
 * @author 70744416353
 */
public class AppAuthorizationException extends AuthorizationException {

    /**
     *
     * @param message
     */
    public AppAuthorizationException(String message) {
		super(message);
	}

	private static final long serialVersionUID = -7623578120645237905L;

}
