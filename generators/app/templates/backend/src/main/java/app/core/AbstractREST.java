/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package app.core;

import br.gov.frameworkdemoiselle.security.LoggedIn;
import br.gov.frameworkdemoiselle.transaction.Transactional;
import br.gov.frameworkdemoiselle.util.ValidatePayload;
import io.swagger.annotations.ApiOperation;
import java.util.List;
import java.util.logging.Logger;
import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

/**
 *
 * @author 70744416353
 * @param <T>
 * @param <I>
 * @param <C>
 */
public abstract class AbstractREST<T, I, C extends RESTCrud<T, I>> {

    protected static final long serialVersionUID = 1L;
    protected final Logger LOG = Logger.getLogger(this.getClass().getName());

    @Inject
    protected AbstractBC<T, I, C> bc;

    /**
     * Removes a instance from delegate.
     *
     * @param id Entity with the given identifier
     */
    @DELETE
    @Path("{id}")
    @Transactional
    @LoggedIn
    @ApiOperation(value = "Remove entidade")
    public void delete(@PathParam("id") final I id) {
        bc.delete(id);
    }

    /**
     * Gets the results from delegate.
     *
     * @return The list of matched query results.
     */
    @GET
    @Transactional
    @LoggedIn
    @ApiOperation(value = "Lista todos os registros registro")
    public List<T> findAll() {
        return bc.findAll();
    }

    /**
     * Delegates the insert operation of the given instance.
     *
     * @param bean A entity to be inserted by the delegate
     * @return
     */
    @POST
    @Transactional
    @ValidatePayload
    @LoggedIn
    @ApiOperation(value = "Insere entidade no banco")
    public T insert(final T bean) {
        return (T) bc.insert(bean);
    }

    /**
     * Returns the instance of the given entity with the given identifier
     *
     * @param id
     * @return The instance
     */
    @GET
    @Path("{id}")
    @Transactional
    @LoggedIn
    @ApiOperation(value = "Busca entidade a partir do ID")
    public T load(@PathParam("id") final I id) {
        return (T) bc.load(id);
    }

    /**
     * Delegates the update operation of the given instance.
     *
     * @param bean The instance containing the updated state.
     * @return
     */
    @PUT
    @Transactional
    @ValidatePayload
    @LoggedIn
    @ApiOperation(value = "Atualiza a entidade", notes = "Atualiza")
    public T update(final T bean) {
        return (T) bc.update(bean);
    }

    /**
     *
     * @param field
     * @param order
     * @param init
     * @param qtde
     * @return
     */
    @GET
    @Path("{field}/{order}/{init}/{qtde}")
    @Transactional
    @LoggedIn
    @ApiOperation(value = "Lista com paginação no servidor", notes = "Informe o campo/ordem(asc/desc)/posição do primeiro registro/quantidade de registros")
    public List list(@PathParam("field") String field, @PathParam("order") String order, @PathParam("init") int init, @PathParam("qtde") int qtde) {
        if ((order.equalsIgnoreCase("asc") || order.equalsIgnoreCase("desc"))) {
            return bc.list(field, order, init, qtde);
        }
        return null;
    }

    /**
     *
     * @param campo
     * @param valor
     * @return
     */
    @GET
    @Path("{field}/{value}")
    @Transactional
    @LoggedIn
    //@ApiOperation(value = "Lista com onde é informado o campo e valor", notes = "Informe o campo/valor do campo")
    public List list(@PathParam("field") final String campo, @PathParam("value") final String valor) {
        return bc.list(campo, valor);
    }

    /**
     *
     * @return
     */
    @GET
    @Path("count")
    @Transactional
    @LoggedIn
    @ApiOperation(value = "Quantidade de registro", notes = "Usado para trabalhar as tabelas com paginação no servidor")
    public Long count() {
        return (Long) bc.count();
    }
}
