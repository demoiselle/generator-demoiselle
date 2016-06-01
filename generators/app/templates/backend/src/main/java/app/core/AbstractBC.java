/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.core;

import java.util.logging.Logger;

/**
 *
 * @author 70744416353
 * @param <T>
 * @param <I>
 * @param <C>
 */
public abstract class AbstractBC<T, I, C extends RESTCrud<T, I>> extends DelegateRESTCrud<T, I, C> {

    protected static final long serialVersionUID = 1L;
    protected final Logger LOG = Logger.getLogger(this.getClass().getName());

}
