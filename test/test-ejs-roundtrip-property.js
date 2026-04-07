'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Load all 4 backend EJS templates
const entityTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'entity', '_pojo.java');
const daoTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'dao', '_pojoDAO.java');
const bcTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'bc', '_pojoBC.java');
const restTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');

const entityTemplate = fs.readFileSync(entityTemplatePath, 'utf-8');
const daoTemplate = fs.readFileSync(daoTemplatePath, 'utf-8');
const bcTemplate = fs.readFileSync(bcTemplatePath, 'utf-8');
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
    properties,
    packages: ['audit', 'export', 'auth', 'observability', 'mcp']
  };
}

function renderEntity(entityName, pkg, project, properties) {
  return ejs.render(entityTemplate, buildTemplateData(entityName, pkg, project, properties));
}

function renderDao(entityName, pkg, project, properties) {
  return ejs.render(daoTemplate, buildTemplateData(entityName, pkg, project, properties));
}

function renderBc(entityName, pkg, project, properties) {
  return ejs.render(bcTemplate, buildTemplateData(entityName, pkg, project, properties));
}

function renderRest(entityName, pkg, project, properties) {
  return ejs.render(restTemplate, buildTemplateData(entityName, pkg, project, properties));
}

/**
 * **Validates: Requirements 9.5**
 *
 * Property 9: Round-trip de templates EJS backend (Demoiselle 4.1)
 *
 * For any valid entity name, package, project, and properties, all 4 backend
 * EJS templates (entity, DAO, BC, REST) must:
 * 1. Render without throwing errors
 * 2. Contain the correct class name matching name.capital
 * 3. Contain the correct package declaration matching package.lower
 * 4. Contain the expected imports
 * 5. Entity template contains property declarations and audit fields
 * 6. DAO template is minimal (delegates to AbstractDAO) with @Cacheable
 * 7. REST template contains endpoint annotations with Demoiselle security
 */
describe('Property 9: Round-trip de templates EJS backend (Demoiselle 4.1)', () => {

  it('todos os 4 templates backend devem renderizar sem erros e produzir Java válido com classe, package e imports corretos para qualquer entidade válida', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const entityCapital = capitalize(entityName);
        const entityLower = entityName.toLowerCase();
        const expectedPkg = `${pkg.lower}.${project.lower}`;

        // --- 1. All templates render without throwing ---
        let entity, dao, bc, rest;
        try {
          entity = renderEntity(entityName, pkg, project, properties);
        } catch (e) {
          assert.fail(`Entity template threw: ${e.message}`);
        }
        try {
          dao = renderDao(entityName, pkg, project, properties);
        } catch (e) {
          assert.fail(`DAO template threw: ${e.message}`);
        }
        try {
          bc = renderBc(entityName, pkg, project, properties);
        } catch (e) {
          assert.fail(`BC template threw: ${e.message}`);
        }
        try {
          rest = renderRest(entityName, pkg, project, properties);
        } catch (e) {
          assert.fail(`REST template threw: ${e.message}`);
        }

        // --- 2. Correct class names ---
        assert.ok(
          new RegExp(`class\\s+${entityCapital}\\s+implements`).test(entity),
          `Entity deve declarar class ${entityCapital}`
        );
        assert.ok(
          new RegExp(`class\\s+${entityCapital}DAO\\s+extends`).test(dao),
          `DAO deve declarar class ${entityCapital}DAO`
        );
        assert.ok(
          new RegExp(`class\\s+${entityCapital}BC\\s+extends`).test(bc),
          `BC deve declarar class ${entityCapital}BC`
        );
        assert.ok(
          new RegExp(`class\\s+${entityCapital}REST\\s+extends`).test(rest),
          `REST deve declarar class ${entityCapital}REST`
        );

        // --- 3. Correct package declarations ---
        assert.ok(
          entity.includes(`package ${expectedPkg}.entity;`),
          `Entity deve declarar package ${expectedPkg}.entity`
        );
        assert.ok(
          dao.includes(`package ${expectedPkg}.dao;`),
          `DAO deve declarar package ${expectedPkg}.dao`
        );
        assert.ok(
          bc.includes(`package ${expectedPkg}.bc;`),
          `BC deve declarar package ${expectedPkg}.bc`
        );
        assert.ok(
          rest.includes(`package ${expectedPkg}.service;`),
          `REST deve declarar package ${expectedPkg}.service`
        );

        // --- 4. Expected imports ---
        // Entity imports
        assert.ok(entity.includes('import jakarta.persistence'), 'Entity deve importar jakarta.persistence');
        assert.ok(entity.includes('import java.util.UUID'), 'Entity deve importar java.util.UUID');

        // DAO imports
        assert.ok(dao.includes(`import ${expectedPkg}.entity.${entityCapital}`), `DAO deve importar a entidade ${entityCapital}`);
        assert.ok(dao.includes('import jakarta.persistence.EntityManager'), 'DAO deve importar EntityManager');

        // BC imports
        assert.ok(bc.includes(`import ${expectedPkg}.entity.${entityCapital}`), `BC deve importar a entidade ${entityCapital}`);

        // REST imports
        assert.ok(rest.includes(`import ${expectedPkg}.bc.${entityCapital}BC`), `REST deve importar ${entityCapital}BC`);
        assert.ok(rest.includes(`import ${expectedPkg}.entity.${entityCapital}`), `REST deve importar a entidade ${entityCapital}`);
        assert.ok(rest.includes('import jakarta.ws.rs'), 'REST deve importar jakarta.ws.rs');

        // --- 5. Entity contains property declarations and audit fields ---
        assert.ok(
          entity.includes('private String description'),
          'Entity deve conter declaração da propriedade description'
        );
        assert.ok(
          entity.includes('private UUID id'),
          'Entity deve conter declaração da propriedade id'
        );
        // Demoiselle 4.1 audit fields
        assert.ok(
          /@CreatedAt/.test(entity),
          'Entity deve conter @CreatedAt para auditoria'
        );
        assert.ok(
          /@UpdatedAt/.test(entity),
          'Entity deve conter @UpdatedAt para auditoria'
        );
        assert.ok(
          /@SoftDeletable/.test(entity),
          'Entity deve conter @SoftDeletable para soft delete'
        );
        assert.ok(
          /AuditEntityListener/.test(entity),
          'Entity deve referenciar AuditEntityListener do framework'
        );

        // --- 6. DAO is minimal with @Cacheable ---
        assert.ok(
          /@Cacheable/.test(dao),
          'DAO deve ter @Cacheable para cache de queries'
        );
        assert.ok(
          !/findBy[A-Z]/.test(dao),
          'DAO NÃO deve conter métodos findBy manuais (AbstractDAO provê filtragem)'
        );

        // --- 7. REST contains endpoint annotations with Demoiselle security ---
        assert.ok(
          rest.includes('@Path('),
          'REST deve conter anotação @Path'
        );
        assert.ok(
          rest.includes('@GET'),
          'REST deve conter anotação @GET'
        );
        assert.ok(
          rest.includes('@Transactional'),
          'REST deve conter anotação @Transactional'
        );
        assert.ok(
          rest.includes('@Operation('),
          'REST deve conter anotação @Operation (OpenAPI)'
        );
        assert.ok(
          rest.includes(`@Path("v1/${entityLower}s")`),
          `REST deve conter @Path com o nome da entidade: v1/${entityLower}s`
        );
        // Demoiselle 4.1 security annotations
        assert.ok(
          /@Authenticated/.test(rest),
          'REST deve conter @Authenticated'
        );
        assert.ok(
          /@RequiredAnyRole/.test(rest),
          'REST deve conter @RequiredAnyRole'
        );
        assert.ok(
          /@Counted/.test(rest),
          'REST deve conter @Counted para observabilidade'
        );
        assert.ok(
          /@Traced/.test(rest),
          'REST deve conter @Traced para rastreamento'
        );
        assert.ok(
          /@CacheControl/.test(rest),
          'REST deve conter @CacheControl no método find()'
        );

        // --- Round-trip: extracted values match input ---
        // Extract class name from entity and verify it matches input
        const classMatch = entity.match(/public class (\w+) implements/);
        assert.ok(classMatch, 'Entity deve conter declaração de classe pública');
        assert.strictEqual(classMatch[1], entityCapital,
          `Nome da classe extraído (${classMatch[1]}) deve corresponder ao input (${entityCapital})`
        );

        // Extract package from entity and verify it matches input
        const pkgMatch = entity.match(/^package ([^;]+);/m);
        assert.ok(pkgMatch, 'Entity deve conter declaração de package');
        assert.strictEqual(pkgMatch[1], `${expectedPkg}.entity`,
          `Package extraído (${pkgMatch[1]}) deve corresponder ao input (${expectedPkg}.entity)`
        );
      }),
      { numRuns: 100 }
    );
  });
});
