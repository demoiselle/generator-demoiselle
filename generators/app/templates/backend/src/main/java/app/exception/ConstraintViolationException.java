package app.exception;

import java.util.Set;

import javax.validation.ConstraintViolation;

/**
 *
 * @author 70744416353
 */
public class ConstraintViolationException extends javax.validation.ConstraintViolationException {

    /**
     *
     * @param constraintViolations
     */
    public ConstraintViolationException(Set<ConstraintViolation<?>> constraintViolations) {
		super(constraintViolations);
	}

	private static final long serialVersionUID = -5834644347779441660L;



}
