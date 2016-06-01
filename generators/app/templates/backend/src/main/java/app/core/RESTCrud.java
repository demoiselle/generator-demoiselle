/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.core;

import br.gov.frameworkdemoiselle.template.JPACrud;
import java.util.List;
import java.util.logging.Logger;

/**
 *
 * @author gladson
 * @param <T>
 * @param <I>
 */
public class RESTCrud<T, I> extends JPACrud<T, I> {

    protected static final long serialVersionUID = 1L;
    protected final Logger LOG = Logger.getLogger(this.getClass().getName());

    /**
     *
     * @return
     */
    public I count() {
        return (I) getEntityManager().createQuery("select COUNT(u) from " + this.getBeanClass().getSimpleName() + " u").getSingleResult();
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    public List list(String field, String order, int init, int qtde) {
        return getEntityManager().createQuery("select u from " + this.getBeanClass().getSimpleName() + " u ORDER BY " + field + " " + order).setFirstResult(init).setMaxResults(qtde).getResultList();
    }

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    public List list(String campo, String valor) {
        return getEntityManager().createQuery("select u from " + this.getBeanClass().getSimpleName() + " u " + " where " + campo + " = " + valor + " ORDER BY " + campo).getResultList();
    }
}
