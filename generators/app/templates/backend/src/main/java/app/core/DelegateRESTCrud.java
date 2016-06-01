/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.core;

import br.gov.frameworkdemoiselle.util.Beans;
import br.gov.frameworkdemoiselle.util.Reflections;
import java.util.List;
import java.util.ListIterator;
import java.util.logging.Logger;

/**
 *
 * @author 70744416353
 * @param <T>
 * @param <I>
 * @param <C>
 */
public class DelegateRESTCrud<T, I, C extends RESTCrud<T, I>> implements ICrudREST<T, I> {

    protected static final long serialVersionUID = 1L;
    protected final Logger LOG = Logger.getLogger(this.getClass().getName());

    private Class<C> delegateClass;

    private transient C delegate;

    /**
     * Removes a instance from delegate.
     *
     * @param id
     * Entity with the given identifier
     */
    @Override
    public void delete(final I id) {
        getDelegate().delete(id);
    }

    /**
     * Removes a list of instances from delegate.
     *
     * @param ids
     * List of entities identifiers
     */
    public void delete(final List<I> ids) {
        ListIterator<I> iter = ids.listIterator();

        while (iter.hasNext()) {
            this.delete(iter.next());
        }
    }

    /**
     * Gets the results from delegate.
     *
     * @return The list of matched query results.
     */
    @Override
    public List<T> findAll() {
        return getDelegate().findAll();
    }

    /**
     *
     * @return
     */
    protected C getDelegate() {
        if (this.delegate == null) {
            this.delegate = Beans.getReference(getDelegateClass());
        }

        return this.delegate;
    }

    /**
     *
     * @return
     */
    protected Class<C> getDelegateClass() {
        if (this.delegateClass == null) {
            this.delegateClass = Reflections.getGenericTypeArgument(this.getClass(), 2);
        }

        return this.delegateClass;
    }

    /**
     * Delegates the insert operation of the given instance.
     *
     * @param bean
     * A entity to be inserted by the delegate
     */
    @Override
    public T insert(final T bean) {
        return getDelegate().insert(bean);
    }

    /**
     * Returns the instance of the given entity with the given identifier
     *
     * @return The instance
     */
    @Override
    public T load(final I id) {
        return getDelegate().load(id);
    }

    /**
     * Delegates the update operation of the given instance.
     *
     * @param bean
     * The instance containing the updated state.
     */
    @Override
    public T update(final T bean) {
        return getDelegate().update(bean);
    }

    /**
     *
     * @return
     */
    @Override
    public I count() {
        return getDelegate().count();
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    @Override
    public List list(String field, String order, int init, int qtde) {
        return getDelegate().list(field, order, init, qtde);
    }

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    @Override
    public List list(String campo, String valor) {
        return getDelegate().list(campo, valor);
    }
}
