package app.dao;

import app.entity.Todo;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.demoiselle.jee.persistence.crud.AbstractDAO;

/**
 * Todo Persistence Controller
 *
 * @author Demoiselle Generator
 */
public class TodoDAO extends AbstractDAO<Todo, String> {

    @PersistenceContext(unitName = "TodoPU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

}
