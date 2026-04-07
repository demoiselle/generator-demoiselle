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
    // Deduplicate by name
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
 * **Validates: Requirements 11.1 (Demoiselle 4.1 native)**
 *
 * Property 10: DAO minimal — delegates filtering to AbstractDAO
 *
 * In Demoiselle 4.1, the AbstractDAO already provides filtering via query string
 * operators (gt:, lt:, gte:, lte:, between:, in:, *pattern* for LIKE).
 * The generated DAO must:
 * - Extend AbstractDAO with correct generic params
 * - Have @Cacheable annotation for query caching
 * - NOT contain manual JPQL query methods (findBy, findByLike, findByBetween, etc.)
 * - Provide EntityManager via getEntityManager()
 */
describe('Property 10: DAO minimal — delegates filtering to AbstractDAO (Demoiselle 4.1)', () => {

  it('DAO gerado deve ser minimal e delegar filtragem ao AbstractDAO para qualquer entidade e propriedades válidas', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const dao = renderDao(entityName, pkg, project, properties);
        const capEntity = capitalize(entityName);

        // DAO must extend AbstractDAO with correct generic params
        const daoExtendsRegex = new RegExp(
          `class\\s+${capEntity}DAO\\s+extends\\s+AbstractDAO\\s*<\\s*${capEntity}\\s*,\\s*UUID\\s*>`
        );
        assert.ok(
          daoExtendsRegex.test(dao),
          `DAO deve estender AbstractDAO<${capEntity}, UUID>`
        );

        // DAO must import AbstractDAO
        assert.ok(
          dao.includes('import org.demoiselle.jee.crud.AbstractDAO'),
          'DAO deve importar org.demoiselle.jee.crud.AbstractDAO'
        );

        // DAO must have @Cacheable annotation
        assert.ok(
          /@Cacheable/.test(dao),
          'DAO deve ter anotação @Cacheable para cache de queries'
        );

        // DAO must import Cacheable from Demoiselle
        assert.ok(
          dao.includes('import org.demoiselle.jee.crud.cache.Cacheable'),
          'DAO deve importar org.demoiselle.jee.crud.cache.Cacheable'
        );

        // DAO must provide EntityManager
        assert.ok(
          /getEntityManager/.test(dao),
          'DAO deve implementar getEntityManager()'
        );
        assert.ok(
          /EntityManager/.test(dao),
          'DAO deve referenciar EntityManager'
        );

        // DAO must NOT contain manual JPQL query methods — AbstractDAO handles filtering
        assert.ok(
          !/findBy[A-Z]/.test(dao),
          'DAO NÃO deve conter métodos findBy manuais (AbstractDAO provê filtragem via query string)'
        );
        assert.ok(
          !/countBy[A-Z]/.test(dao),
          'DAO NÃO deve conter métodos countBy manuais'
        );
        assert.ok(
          !/existsBy[A-Z]/.test(dao),
          'DAO NÃO deve conter métodos existsBy manuais'
        );
        assert.ok(
          !/JPQL|createQuery/.test(dao),
          'DAO NÃO deve conter JPQL manual ou createQuery'
        );

        // Verify entity class name appears in the DAO
        assert.ok(
          dao.includes(`${capEntity}DAO`),
          `DAO deve conter o nome da classe ${capEntity}DAO`
        );

        // Verify package declaration
        assert.ok(
          dao.includes(`package ${pkg.lower}.${project.lower}.dao`),
          `DAO deve conter declaração de package correta`
        );
      }),
      { numRuns: 100 }
    );
  });
});
