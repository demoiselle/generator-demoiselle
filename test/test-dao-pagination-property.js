'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'dao', '_pojoDAO.java');
const daoTemplate = fs.readFileSync(templatePath, 'utf-8');

/**
 * Supported Java types for property generation
 */
const JAVA_TYPES = ['String', 'Integer', 'Long', 'Date', 'LocalDate', 'Double', 'BigDecimal', 'boolean'];

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Arbitrary for entity name (valid Java identifier, lowercase start)
 */
const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

/**
 * Arbitrary for package name (Java package)
 */
const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

/**
 * Arbitrary for project name
 */
const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

/**
 * Arbitrary for a single Java property
 */
const propertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_TYPES),
  isReadOnly: fc.boolean()
});

/**
 * Arbitrary for an array of properties with unique names, at least 1 property
 */
const propertiesArb = fc.array(propertyArb, { minLength: 1, maxLength: 6 })
  .map(props => {
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  })
  .filter(props => props.length >= 1);

/**
 * Renders the DAO EJS template with given values
 */
function renderDao(entityName, pkg, project, properties) {
  const name = {
    lower: entityName.toLowerCase(),
    capital: capitalize(entityName)
  };
  return ejs.render(daoTemplate, {
    name,
    package: pkg,
    project,
    properties
  });
}

/**
 * **Validates: Requirements 11.8 (Demoiselle 4.1 native)**
 *
 * Property 11: Paginação e ordenação delegadas ao AbstractDAO
 *
 * In Demoiselle 4.1, pagination and sorting are handled by the framework's
 * AbstractDAO via query string operators and the CrudFilter. The generated DAO
 * must:
 * - Extend AbstractDAO (which provides built-in pagination/sorting)
 * - NOT contain manual JPQL pagination methods (setFirstResult, setMaxResults)
 * - NOT contain manual ORDER BY logic
 * - Have @Cacheable for query caching
 * - Be minimal — only provide EntityManager
 */
describe('Property 11: Paginação e ordenação delegadas ao AbstractDAO (Demoiselle 4.1)', () => {

  it('DAO deve delegar paginação e ordenação ao AbstractDAO do framework para qualquer entidade e propriedades válidas', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const dao = renderDao(entityName, pkg, project, properties);
        const capEntity = capitalize(entityName);

        // DAO must extend AbstractDAO
        const daoExtendsRegex = new RegExp(
          `class\\s+${capEntity}DAO\\s+extends\\s+AbstractDAO\\s*<\\s*${capEntity}\\s*,\\s*UUID\\s*>`
        );
        assert.ok(
          daoExtendsRegex.test(dao),
          `DAO deve estender AbstractDAO<${capEntity}, UUID>`
        );

        // DAO must NOT contain manual pagination (setFirstResult, setMaxResults)
        assert.ok(
          !/setFirstResult/.test(dao),
          'DAO NÃO deve conter setFirstResult (paginação é gerenciada pelo AbstractDAO)'
        );
        assert.ok(
          !/setMaxResults/.test(dao),
          'DAO NÃO deve conter setMaxResults (paginação é gerenciada pelo AbstractDAO)'
        );

        // DAO must NOT contain manual ORDER BY logic
        assert.ok(
          !/ORDER BY/i.test(dao),
          'DAO NÃO deve conter ORDER BY manual (ordenação é gerenciada pelo AbstractDAO)'
        );

        // DAO must NOT contain manual JPQL queries
        assert.ok(
          !/createQuery/.test(dao),
          'DAO NÃO deve conter createQuery manual'
        );

        // DAO must have @Cacheable
        assert.ok(
          /@Cacheable/.test(dao),
          'DAO deve ter @Cacheable para cache de queries'
        );

        // DAO must provide EntityManager
        assert.ok(
          /getEntityManager/.test(dao),
          'DAO deve implementar getEntityManager()'
        );

        // DAO must import AbstractDAO
        assert.ok(
          dao.includes('import org.demoiselle.jee.crud.AbstractDAO'),
          'DAO deve importar org.demoiselle.jee.crud.AbstractDAO'
        );

        // Verify package declaration
        assert.ok(
          dao.includes(`package ${pkg.lower}.${project.lower}.dao`),
          'DAO deve conter declaração de package correta'
        );
      }),
      { numRuns: 100 }
    );
  });
});
