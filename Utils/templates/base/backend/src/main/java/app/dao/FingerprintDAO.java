package <%= package.lower %>.<%= project.lower %>.dao;

import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import  java.util.List;
import <%= package.lower %>.<%= project.lower %>.entity.Fingerprint;
import org.demoiselle.jee.crud.AbstractDAO;


/**
 *
 * @author gladson
 */
public class FingerprintDAO extends AbstractDAO< Fingerprint, Long> {

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

        /**
     *
     * @param id
     * @return
     */
    public List<Fingerprint> findByUsuario(String id) {
        return em.createNamedQuery("Fingerprint.findByUsuario").setParameter("usuario", id).getResultList();
    }

    /**
     *
     * @param id
     * @return
     */
    public List<Fingerprint> findByCodigo(String id) {
        return em.createNamedQuery("Fingerprint.findByCodigo").setParameter("codigo", id).getResultList();
    }
}
