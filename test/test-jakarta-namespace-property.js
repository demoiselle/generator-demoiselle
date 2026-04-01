'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Load all three backend EJS templates
const entityTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'entity', '_pojo.java');
const daoTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'dao', '_pojoDAO.java');
const restTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');

const entityTemplate = fs.readFileSync(entityTemplatePath, 'utf-8');
const daoTemplate = fs.readFileSync(daoTemplatePath, 'utf-8');
const restTemplate = fs.readFileSync(restTemplatePath, 'utf-8');

// --- Arbitraries ---

const JAVA_TYPES = ['String', 'Integer', 'Long', 'Date', 'LocalDate', 'Double', 'BigDecimal', 'boolean'];

const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

const propertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_TYPES),
  isReadOnly: fc.boolean()
});

const propertiesArb = fc.array(propertyArb, { minLength: 1, maxLength: 5 })
  .map(props => {
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  })
  .filter(props => props.length >= 1);

// --- Helpers ---

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildTemplateData(entityName, pkg, project, properties) {
  return {
    name: {
      lower: entityName.toLowerCase(),
      capital: capitalize(entityName)
    },
    package: pkg,
    project,
    properties
  };
}

function renderEntity(entityName, pkg, project) {
  return ejs.render(entityTemplate, buildTemplateData(entityName, pkg, project, []));
}

function renderDao(entityName, pkg, project, properties) {
  return ejs.render(daoTemplate, buildTemplateData(entityName, pkg, project, properties));
}

function renderRest(entityName, pkg, project, properties) {
  return ejs.render(restTemplate, buildTemplateData(entityName, pkg, project, properties));
}

/**
 * Forbidden javax namespaces that must NOT appear in any generated template
 */
const FORBIDDEN_JAVAX = [
  'javax.persistence',
  'javax.validation',
  'javax.transaction',
  'javax.ws.rs',
  'javax.xml.bind'
];

/**
 * Asserts that a rendered template does not contain any forbidden javax.* imports
 * and that jakarta.* equivalents are used where applicable.
 */
function assertJakartaNamespace(rendered, templateLabel) {
  // 1. No forbidden javax.* imports
  FORBIDDEN_JAVAX.forEach(ns => {
    assert.ok(
      !rendered.includes(ns),
      `${templateLabel} NÃO deve conter '${ns}' — deve usar jakarta.* equivalente`
    );
  });

  // 2. If persistence imports exist, they must use jakarta.persistence
  if (/import\s+.*\.persistence\./.test(rendered)) {
    assert.ok(
      rendered.includes('jakarta.persistence'),
      `${templateLabel} deve usar 'jakarta.persistence' para imports de persistência`
    );
  }

  // 3. If validation imports exist, they must use jakarta.validation
  if (/import\s+.*\.validation\./.test(rendered)) {
    assert.ok(
      rendered.includes('jakarta.validation'),
      `${templateLabel} deve usar 'jakarta.validation' para imports de validação`
    );
  }

  // 4. If transaction imports exist, they must use jakarta.transaction
  if (/import\s+.*\.transaction\./.test(rendered)) {
    assert.ok(
      rendered.includes('jakarta.transaction'),
      `${templateLabel} deve usar 'jakarta.transaction' para imports de transação`
    );
  }

  // 5. If ws.rs imports exist, they must use jakarta.ws.rs
  if (/import\s+.*\.ws\.rs\./.test(rendered) || /import\s+.*\.ws\.rs;/.test(rendered)) {
    assert.ok(
      rendered.includes('jakarta.ws.rs'),
      `${templateLabel} deve usar 'jakarta.ws.rs' para imports JAX-RS`
    );
  }
}

/**
 * **Validates: Requirements 1.3, 2.1, 2.2, 2.5**
 *
 * Property 2: Migração de namespace jakarta.*
 *
 * For any valid entity name, package, project, and properties, ALL three backend
 * EJS templates (entity, dao, service) must:
 * - NOT contain any javax.persistence imports
 * - NOT contain any javax.validation imports
 * - NOT contain any javax.transaction imports
 * - NOT contain any javax.ws.rs imports
 * - NOT contain javax.xml.bind imports
 * - If persistence imports exist, use jakarta.persistence
 * - If validation imports exist, use jakarta.validation
 * - If transaction imports exist, use jakarta.transaction
 * - If ws.rs imports exist, use jakarta.ws.rs
 */
describe('Property 2: Migração de namespace jakarta.*', () => {

  it('todos os templates backend devem usar jakarta.* em vez de javax.* para qualquer entidade válida', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        // Render all three templates
        const entity = renderEntity(entityName, pkg, project);
        const dao = renderDao(entityName, pkg, project, properties);
        const rest = renderRest(entityName, pkg, project, properties);

        // Assert jakarta namespace compliance on each
        assertJakartaNamespace(entity, `Entity (_pojo.java) [${entityName}]`);
        assertJakartaNamespace(dao, `DAO (_pojoDAO.java) [${entityName}]`);
        assertJakartaNamespace(rest, `REST (_pojoREST.java) [${entityName}]`);

        // Additional positive checks: verify each template uses the expected jakarta imports

        // Entity MUST have jakarta.persistence (it always uses @Entity, @Id, etc.)
        assert.ok(
          entity.includes('jakarta.persistence'),
          `Entity deve conter imports jakarta.persistence`
        );

        // Entity MUST have jakarta.validation (it uses @NotNull, @Size)
        assert.ok(
          entity.includes('jakarta.validation'),
          `Entity deve conter imports jakarta.validation`
        );

        // DAO MUST have jakarta.persistence (it uses EntityManager, TypedQuery, etc.)
        assert.ok(
          dao.includes('jakarta.persistence'),
          `DAO deve conter imports jakarta.persistence`
        );

        // REST MUST have jakarta.transaction (it uses @Transactional)
        assert.ok(
          rest.includes('jakarta.transaction'),
          `REST deve conter imports jakarta.transaction`
        );

        // REST MUST have jakarta.ws.rs (it uses @GET, @Path, @Produces, etc.)
        assert.ok(
          rest.includes('jakarta.ws.rs'),
          `REST deve conter imports jakarta.ws.rs`
        );
      }),
      { numRuns: 100 }
    );
  });
});
