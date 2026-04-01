package <%= package.lower %>.<%= project.lower %>.dao;

import <%= package.lower %>.<%= project.lower %>.entity.<%= name.capital %>;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.demoiselle.jee.crud.AbstractDAO;

<%
function isStringType(type) {
    return /^string$/i.test(type);
}
function isDateOrNumberType(type) {
    return /^(date|localdate|localdatetime|integer|int|long|double|float|bigdecimal|number|short)$/i.test(type);
}
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
var nonReadOnly = (properties || []).filter(function(p) { return !p.isReadOnly; });
var eligible = nonReadOnly.filter(function(p) { return p.name !== 'id'; });
var combos = [];
for (var i = 0; i < eligible.length; i++) {
    for (var j = i + 1; j < eligible.length; j++) {
        combos.push([eligible[i], eligible[j]]);
    }
}
%>
public class <%= name.capital %>DAO extends AbstractDAO<<%= name.capital %>, UUID> {

    @PersistenceContext(unitName = "<%= project.lower %>PU")
    protected EntityManager em;

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

<% nonReadOnly.forEach(function(prop) { %>
<% var capName = capitalize(prop.name); %>
    // --- findBy<%= capName %> ---
    public List<<%= name.capital %>> findBy<%= capName %>(<%= prop.type %> value, int page, int size, String sortField, String sortDirection) {
        String jpql = "SELECT e FROM <%= name.capital %> e WHERE e.<%= prop.name %> = :value";
        if (sortField != null && !sortField.isEmpty()) {
            jpql += " ORDER BY e." + sortField + ("DESC".equalsIgnoreCase(sortDirection) ? " DESC" : " ASC");
        }
        TypedQuery<<%= name.capital %>> query = em.createQuery(jpql, <%= name.capital %>.class);
        query.setParameter("value", value);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }

    // --- findBy<%= capName %>In ---
    public List<<%= name.capital %>> findBy<%= capName %>In(List<<%= prop.type %>> values, int page, int size, String sortField, String sortDirection) {
        String jpql = "SELECT e FROM <%= name.capital %> e WHERE e.<%= prop.name %> IN :values";
        if (sortField != null && !sortField.isEmpty()) {
            jpql += " ORDER BY e." + sortField + ("DESC".equalsIgnoreCase(sortDirection) ? " DESC" : " ASC");
        }
        TypedQuery<<%= name.capital %>> query = em.createQuery(jpql, <%= name.capital %>.class);
        query.setParameter("values", values);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }

    // --- countBy<%= capName %> ---
    public long countBy<%= capName %>(<%= prop.type %> value) {
        TypedQuery<Long> query = em.createQuery(
            "SELECT COUNT(e) FROM <%= name.capital %> e WHERE e.<%= prop.name %> = :value", Long.class);
        query.setParameter("value", value);
        return query.getSingleResult();
    }

    // --- existsBy<%= capName %> ---
    public boolean existsBy<%= capName %>(<%= prop.type %> value) {
        TypedQuery<Long> query = em.createQuery(
            "SELECT COUNT(e) FROM <%= name.capital %> e WHERE e.<%= prop.name %> = :value", Long.class);
        query.setParameter("value", value);
        return query.getSingleResult() > 0;
    }
<% if (isStringType(prop.type)) { %>

    // --- findBy<%= capName %>Like ---
    public List<<%= name.capital %>> findBy<%= capName %>Like(String pattern, int page, int size, String sortField, String sortDirection) {
        String jpql = "SELECT e FROM <%= name.capital %> e WHERE e.<%= prop.name %> LIKE :pattern";
        if (sortField != null && !sortField.isEmpty()) {
            jpql += " ORDER BY e." + sortField + ("DESC".equalsIgnoreCase(sortDirection) ? " DESC" : " ASC");
        }
        TypedQuery<<%= name.capital %>> query = em.createQuery(jpql, <%= name.capital %>.class);
        query.setParameter("pattern", pattern);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }
<% } %>
<% if (isDateOrNumberType(prop.type)) { %>

    // --- findBy<%= capName %>Between ---
    public List<<%= name.capital %>> findBy<%= capName %>Between(<%= prop.type %> min, <%= prop.type %> max, int page, int size, String sortField, String sortDirection) {
        String jpql = "SELECT e FROM <%= name.capital %> e WHERE e.<%= prop.name %> BETWEEN :min AND :max";
        if (sortField != null && !sortField.isEmpty()) {
            jpql += " ORDER BY e." + sortField + ("DESC".equalsIgnoreCase(sortDirection) ? " DESC" : " ASC");
        }
        TypedQuery<<%= name.capital %>> query = em.createQuery(jpql, <%= name.capital %>.class);
        query.setParameter("min", min);
        query.setParameter("max", max);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }
<% } %>
<% }); %>

<% combos.forEach(function(combo) { %>
<% var capName1 = capitalize(combo[0].name); var capName2 = capitalize(combo[1].name); %>
    // --- findBy<%= capName1 %>And<%= capName2 %> ---
    public List<<%= name.capital %>> findBy<%= capName1 %>And<%= capName2 %>(<%= combo[0].type %> value1, <%= combo[1].type %> value2, int page, int size, String sortField, String sortDirection) {
        String jpql = "SELECT e FROM <%= name.capital %> e WHERE e.<%= combo[0].name %> = :value1 AND e.<%= combo[1].name %> = :value2";
        if (sortField != null && !sortField.isEmpty()) {
            jpql += " ORDER BY e." + sortField + ("DESC".equalsIgnoreCase(sortDirection) ? " DESC" : " ASC");
        }
        TypedQuery<<%= name.capital %>> query = em.createQuery(jpql, <%= name.capital %>.class);
        query.setParameter("value1", value1);
        query.setParameter("value2", value2);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        return query.getResultList();
    }
<% }); %>

}
