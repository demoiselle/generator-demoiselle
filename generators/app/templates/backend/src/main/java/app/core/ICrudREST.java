/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.core;

import br.gov.frameworkdemoiselle.template.Crud;
import java.util.List;

/**
 *
 * @author 70744416353
 * @param <T>
 * @param <I>
 */
public interface ICrudREST<T, I> extends Crud<T, I> {

    /**
     *
     * @return
     */
    I count();

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    List<T> list(String field, String order, int init, int qtde);

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    List<T> list(String campo, String valor);
}
