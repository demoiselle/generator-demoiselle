'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Load DAO and BC EJS templates
const daoTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'dao', '_pojoDAO.java');
const bcTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'bc', '_pojoBC.java');

const daoTemplate = fs.readFileSync(daoTemplatePath, 'utf-8');
const bcTemplate = fs.readFileSync(bcTemplatePath, 'utf-8');

// Load frontend package.json EJS template
const frontendPkgTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'package.json');
const frontendPkgTemplate = fs.readFileSync(frontendPkgTemplatePath, 'utf-8');

const PackageRegistry = require('../Utils/packageRegistry');
const registry = new PackageRegistry();
const allPackages = registry.getAvailablePackages().map(p => p.slug);
const allNpmDeps = registry.getNpmDeps(allPackages);

// Base-only npm deps (no optional packages selected)
const baseNpmDeps = {};

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

const propertiesArb = fc.array(propertyArb, { minLength: 0, maxLength: 5 })
  .map(props => {
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  });

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
    packages: ['observability']
  };
}

function renderDao(entityName, pkg, project, properties) {
  return ejs.render(daoTemplate, buildTemplateData(entityName, pkg, project, properties));
}

function renderBc(entityName, pkg, project) {
  return ejs.render(bcTemplate, buildTemplateData(entityName, pkg, project, []));
}

/**
 * **Validates: Requirements 2.3, 2.4**
 *
 * Property 3: Classes base Demoiselle 4.1
 *
 * For any valid entity name, package, and project, the generated DAO and BC must:
 * - DAO class extends AbstractDAO from org.demoiselle.jee.crud
 * - BC class extends AbstractBusiness from org.demoiselle.jee.crud
 * - Both use the correct generic type parameters (Entity class and UUID)
 * - DAO has @Cacheable annotation (Demoiselle 4.1)
 * - BC has @Counted annotation (Demoiselle 4.1)
 */
describe('Property 3: Classes base Demoiselle 4.1', () => {

  it('DAO deve estender AbstractDAO e BC deve estender AbstractBusiness do Demoiselle 4.1 para qualquer entidade válida', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const entityCapital = capitalize(entityName);
        const dao = renderDao(entityName, pkg, project, properties);
        const bc = renderBc(entityName, pkg, project);

        // --- DAO assertions ---

        // DAO must import AbstractDAO from org.demoiselle.jee.crud
        assert.ok(
          dao.includes('import org.demoiselle.jee.crud.AbstractDAO'),
          `DAO deve importar org.demoiselle.jee.crud.AbstractDAO`
        );

        // DAO class must extend AbstractDAO with correct generic params <Entity, UUID>
        const daoExtendsRegex = new RegExp(
          `class\\s+${entityCapital}DAO\\s+extends\\s+AbstractDAO\\s*<\\s*${entityCapital}\\s*,\\s*UUID\\s*>`
        );
        assert.ok(
          daoExtendsRegex.test(dao),
          `DAO deve estender AbstractDAO<${entityCapital}, UUID>`
        );

        // DAO must import UUID
        assert.ok(
          dao.includes('import java.util.UUID'),
          `DAO deve importar java.util.UUID`
        );

        // DAO must have @Cacheable (Demoiselle 4.1)
        assert.ok(
          /@Cacheable/.test(dao),
          'DAO deve ter @Cacheable para cache de queries'
        );

        // --- BC assertions ---

        // BC must import AbstractBusiness from org.demoiselle.jee.crud
        assert.ok(
          bc.includes('import org.demoiselle.jee.crud.AbstractBusiness'),
          `BC deve importar org.demoiselle.jee.crud.AbstractBusiness`
        );

        // BC class must extend AbstractBusiness with correct generic params <Entity, UUID>
        const bcExtendsRegex = new RegExp(
          `class\\s+${entityCapital}BC\\s+extends\\s+AbstractBusiness\\s*<\\s*${entityCapital}\\s*,\\s*UUID\\s*>`
        );
        assert.ok(
          bcExtendsRegex.test(bc),
          `BC deve estender AbstractBusiness<${entityCapital}, UUID>`
        );

        // BC must import UUID
        assert.ok(
          bc.includes('import java.util.UUID'),
          `BC deve importar java.util.UUID`
        );

        // BC must have @Counted (Demoiselle 4.1)
        assert.ok(
          /@Counted/.test(bc),
          'BC deve ter @Counted para métricas de observabilidade'
        );

        // Both must import the entity class
        assert.ok(
          dao.includes(`import ${pkg.lower}.${project.lower}.entity.${entityCapital}`),
          `DAO deve importar a entidade ${entityCapital}`
        );
        assert.ok(
          bc.includes(`import ${pkg.lower}.${project.lower}.entity.${entityCapital}`),
          `BC deve importar a entidade ${entityCapital}`
        );
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 3.6**
 *
 * Property 6: Dependências Vue.js no package.json do frontend
 *
 * For any valid project name, the generated frontend package.json must:
 * - Contain vue (version 3.x) as a dependency
 * - Contain vue-router as a dependency
 * - Contain pinia as a dependency
 * - Contain axios as a dependency
 * - Contain vue-i18n as a dependency
 * - Contain @vueuse/core as a dependency
 * - NOT contain any Angular dependencies (@angular/*, ngx-bootstrap, @demoiselle/http, @demoiselle/security)
 */
describe('Property 6: Dependências Vue.js no package.json do frontend', () => {

  it('package.json do frontend deve conter dependências Vue.js 3 e NÃO conter dependências Angular para qualquer projeto válido', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, (project) => {
        const rendered = ejs.render(frontendPkgTemplate, { project, npmDeps: baseNpmDeps });
        const pkg = JSON.parse(rendered);

        // --- Vue.js 3 dependencies must be present ---

        assert.ok(
          pkg.dependencies && pkg.dependencies['vue'],
          'package.json deve conter "vue" como dependência'
        );
        assert.ok(
          /^\^3\./.test(pkg.dependencies['vue']),
          `vue deve ser versão 3.x, encontrado: ${pkg.dependencies['vue']}`
        );

        assert.ok(
          pkg.dependencies['vue-router'],
          'package.json deve conter "vue-router" como dependência'
        );

        assert.ok(
          pkg.dependencies['pinia'],
          'package.json deve conter "pinia" como dependência'
        );

        assert.ok(
          pkg.dependencies['axios'],
          'package.json deve conter "axios" como dependência'
        );

        // vue-i18n is now conditional (only with i18n package)
        assert.ok(
          !pkg.dependencies['vue-i18n'],
          'package.json base NÃO deve conter "vue-i18n" (agora condicional via pacote i18n)'
        );

        assert.ok(
          pkg.dependencies['@vueuse/core'],
          'package.json deve conter "@vueuse/core" como dependência'
        );

        // --- Angular dependencies must NOT be present ---

        const allDeps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});
        const allDepNames = Object.keys(allDeps);

        const angularDeps = allDepNames.filter(dep =>
          dep.startsWith('@angular/') ||
          dep === 'ngx-bootstrap' ||
          dep === '@demoiselle/http' ||
          dep === '@demoiselle/security'
        );

        assert.strictEqual(
          angularDeps.length,
          0,
          `package.json NÃO deve conter dependências Angular, encontradas: ${angularDeps.join(', ')}`
        );

        // --- Verify project name interpolation ---

        assert.ok(
          pkg.name && pkg.name.includes(project.lower),
          `package.json "name" deve conter o nome do projeto: ${project.lower}`
        );
      }),
      { numRuns: 100 }
    );
  });
});
