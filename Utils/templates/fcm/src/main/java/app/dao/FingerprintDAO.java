package <%= package.lower %>.<%= project.lower %>.dao;

import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import <%= package.lower %>.<%= project.lower %>.entity.Fingerprint;
import org.demoiselle.jee.crud.AbstractDAO;


/**
 *
 * @author gladson
 */
public class FingerprintDAO extends AbstractDAO< Fingerprint, String> {

    private static final Logger LOG = getLogger(FingerprintDAO.class.getName());

    /**
     *
     */
    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    /**
     *
     * @return
     */
    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

}
