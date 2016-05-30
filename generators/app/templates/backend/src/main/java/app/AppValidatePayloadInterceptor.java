package app;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.interceptor.AroundInvoke;
import javax.interceptor.Interceptor;
import javax.interceptor.InvocationContext;
import javax.validation.ConstraintViolation;
import javax.validation.UnexpectedTypeException;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import app.exception.ConstraintViolationException;

import br.gov.frameworkdemoiselle.util.ValidatePayload;

/**
 *
 * @author 70744416353
 */
@Interceptor
@ValidatePayload
public class AppValidatePayloadInterceptor implements Serializable{

	private static final long serialVersionUID = 1L;

    /**
     *
     * @param ic
     * @return
     * @throws Exception
     */
    @AroundInvoke
	public Object manage(final InvocationContext ic) throws Exception {
		Set<ConstraintViolation<?>> violations = new HashSet<ConstraintViolation<?>>();

		for (Object params : ic.getParameters()) {
			if (params != null) {
				ValidatorFactory dfv = Validation.buildDefaultValidatorFactory();
				Validator validator = dfv.getValidator();

				try {
					violations.addAll(validator.validate(params));
				} catch (UnexpectedTypeException cause) {
				}
			}
		}

		if (!violations.isEmpty()) {
			throw new ConstraintViolationException(violations);
		}

		return ic.proceed();
	}

}
