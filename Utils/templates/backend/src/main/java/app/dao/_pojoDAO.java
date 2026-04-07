package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.demoiselle.jee.crud.AbstractDAO;
import org.demoiselle.jee.crud.cache.Cacheable;

@Cacheable
public class <%= name.capital %>DAO extends AbstractDAO<<%= name.capital %>, UUID> {

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

}
