'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load templates ---

const routesTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entity.routes.js');
const routerIndexPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'router', 'index.js');

const routesTemplate = fs.readFileSync(routesTemplatePath, 'utf-8');
const routerIndex = fs.readFileSync(routerIndexPath, 'utf-8');

// --- Arbitraries ---

const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

// --- Helpers ---

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderRoutes(entityName) {
  return ejs.render(routesTemplate, {
    name: {
      lower: entityName.toLowerCase(),
      capital: capitalize(entityName)
    }
  });
}

/**
 * Simulates what _addChildrenRoute does: given the router index.js content and an entity,
 * produces the modified content with the import statement and route spread added.
 */
function simulateAddChildrenRoute(routerContent, entityName) {
  const lower = entityName.toLowerCase();
  const capital = capitalize(entityName);

  // Avoid duplicates (same logic as FrontendUtil._addChildrenRoute)
  if ((new RegExp(lower, 'i')).test(routerContent)) {
    return routerContent;
  }

  const importStatement = `import ${capital}Routes from '@/app/${lower}/${lower}.routes.js';\n`;
  const spreadRoutes = `      ...${capital}Routes,`;

  // Add import at the top of the file (after last import)
  const importRegEx = new RegExp('(import [^;]+;[\\r\\n]+)(?!import)', 'm');
  let newContent = routerContent.replace(importRegEx, '$1' + importStatement);

  // Add route spread in children array
  const childrenRegEx = new RegExp('// CRUD routes will be added here by the generator');
  newContent = newContent.replace(childrenRegEx, spreadRoutes + '\n      // CRUD routes will be added here by the generator');

  return newContent;
}


/**
 * **Validates: Requirements 4.5, 7.2**
 *
 * Property 7: Registro automático de rotas no Vue Router
 *
 * For any valid entity name, after CRUD generation:
 * - The _entity.routes.js template generates valid route config with list, create, edit routes
 * - The route config has correct component imports and :id parameter on edit
 * - The _addChildrenRoute logic correctly adds import statement and route spread to router/index.js
 * - The router/index.js base template has the expected structure for route injection
 * - No Angular routing patterns (RouterModule, app-routing.module.ts) are referenced
 */
describe('Property 7: Registro automático de rotas no Vue Router', () => {

  // --- Req 4.5: _entity.routes.js generates valid route configuration ---

  it('_entity.routes.js deve gerar rotas list, create e edit com componentes corretos para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const routes = renderRoutes(entityName);
        const lower = entityName.toLowerCase();
        const capital = capitalize(entityName);

        // Must contain list route with correct name
        assert.ok(
          routes.includes(`'${lower}-list'`),
          `Routes deve conter rota com name '${lower}-list'`
        );

        // Must contain create route with correct name
        assert.ok(
          routes.includes(`'${lower}-create'`),
          `Routes deve conter rota com name '${lower}-create'`
        );

        // Must contain edit route with correct name
        assert.ok(
          routes.includes(`'${lower}-edit'`),
          `Routes deve conter rota com name '${lower}-edit'`
        );

        // Edit route must have :id parameter
        assert.ok(
          routes.includes(':id'),
          'Rota de edição deve conter parâmetro :id'
        );

        // Must import List component
        assert.ok(
          routes.includes(`${capital}List`),
          `Routes deve importar componente ${capital}List`
        );

        // Must import Form component
        assert.ok(
          routes.includes(`${capital}Form`),
          `Routes deve importar componente ${capital}Form`
        );

        // Must export as default
        assert.ok(
          /export\s+default/.test(routes),
          'Routes deve exportar configuração como default'
        );

        // Must NOT contain Angular routing patterns
        assert.ok(
          !/RouterModule/.test(routes),
          'Routes NÃO deve conter RouterModule (Angular)'
        );
        assert.ok(
          !/NgModule/.test(routes),
          'Routes NÃO deve conter NgModule (Angular)'
        );
        assert.ok(
          !/app-routing\.module/.test(routes),
          'Routes NÃO deve referenciar app-routing.module.ts (Angular)'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 7.2: _addChildrenRoute modifies Vue Router index.js correctly ---

  it('_addChildrenRoute deve adicionar import e spread de rotas no router/index.js para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();
        const capital = capitalize(entityName);

        const modified = simulateAddChildrenRoute(routerIndex, entityName);

        // The base router must not already contain the entity (precondition)
        // If it does, the function returns unchanged content — skip assertion
        if ((new RegExp(lower, 'i')).test(routerIndex)) {
          return true;
        }

        // Must contain the import statement for entity routes
        const expectedImport = `import ${capital}Routes from '@/app/${lower}/${lower}.routes.js';`;
        assert.ok(
          modified.includes(expectedImport),
          `Router modificado deve conter import: ${expectedImport}`
        );

        // Must contain the spread of entity routes in children
        const expectedSpread = `...${capital}Routes`;
        assert.ok(
          modified.includes(expectedSpread),
          `Router modificado deve conter spread: ${expectedSpread}`
        );

        // The CRUD marker comment must still be present (for future entities)
        assert.ok(
          modified.includes('// CRUD routes will be added here by the generator'),
          'Marcador de CRUD deve permanecer no router após adição de rotas'
        );

        // Must NOT reference Angular routing
        assert.ok(
          !/app-routing\.module/.test(modified),
          'Router modificado NÃO deve referenciar app-routing.module.ts (Angular)'
        );

        // The import must appear before the routes array definition
        const importIndex = modified.indexOf(expectedImport);
        const routesArrayIndex = modified.indexOf('const routes = [');
        assert.ok(
          importIndex < routesArrayIndex,
          'Import da entidade deve aparecer antes da definição do array de rotas'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.5: Multiple entities can be registered sequentially ---

  it('múltiplas entidades devem poder ser registradas sequencialmente no router/index.js', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(
        fc.array(entityNameArb, { minLength: 2, maxLength: 5 })
          .map(names => {
            // Ensure unique lowercase names
            const seen = new Set();
            return names.filter(n => {
              const lower = n.toLowerCase();
              if (seen.has(lower)) return false;
              seen.add(lower);
              return true;
            });
          })
          .filter(names => names.length >= 2),
        (entityNames) => {
          let content = routerIndex;

          // Register each entity sequentially
          for (const entityName of entityNames) {
            content = simulateAddChildrenRoute(content, entityName);
          }

          // Verify all entities are registered
          for (const entityName of entityNames) {
            const lower = entityName.toLowerCase();
            const capital = capitalize(entityName);

            // Skip entities that match existing content in the base router
            if ((new RegExp(lower, 'i')).test(routerIndex)) {
              continue;
            }

            assert.ok(
              content.includes(`import ${capital}Routes from '@/app/${lower}/${lower}.routes.js';`),
              `Router deve conter import para entidade "${entityName}"`
            );
            assert.ok(
              content.includes(`...${capital}Routes`),
              `Router deve conter spread para entidade "${entityName}"`
            );
          }

          // Marker comment must still be present
          assert.ok(
            content.includes('// CRUD routes will be added here by the generator'),
            'Marcador de CRUD deve permanecer após múltiplas adições'
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  // --- Req 7.2: Base router/index.js uses Vue Router, not Angular ---

  it('router/index.js base deve usar Vue Router (createRouter, createWebHistory) e não Angular', function () {
    this.timeout(30000);

    // Must use Vue Router APIs
    assert.ok(
      /createRouter/.test(routerIndex),
      'router/index.js deve usar createRouter do Vue Router'
    );
    assert.ok(
      /createWebHistory/.test(routerIndex),
      'router/index.js deve usar createWebHistory do Vue Router'
    );
    assert.ok(
      /from\s+['"]vue-router['"]/.test(routerIndex),
      'router/index.js deve importar de vue-router'
    );

    // Must have children array with CRUD marker
    assert.ok(
      routerIndex.includes('// CRUD routes will be added here by the generator'),
      'router/index.js deve conter marcador para adição de rotas CRUD'
    );

    // Must have auth guard (beforeEach)
    assert.ok(
      /router\.beforeEach/.test(routerIndex),
      'router/index.js deve conter guard de autenticação (beforeEach)'
    );

    // Must NOT contain Angular patterns
    assert.ok(
      !/RouterModule/.test(routerIndex),
      'router/index.js NÃO deve conter RouterModule (Angular)'
    );
    assert.ok(
      !/NgModule/.test(routerIndex),
      'router/index.js NÃO deve conter NgModule (Angular)'
    );
    assert.ok(
      !/app-routing\.module/.test(routerIndex),
      'router/index.js NÃO deve referenciar app-routing.module.ts'
    );
  });

  // --- Req 4.5: Duplicate entity registration is idempotent ---

  it('registrar a mesma entidade duas vezes deve ser idempotente (sem duplicatas)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();

        // Skip if entity name matches something already in the base router
        if ((new RegExp(lower, 'i')).test(routerIndex)) {
          return true;
        }

        const afterFirst = simulateAddChildrenRoute(routerIndex, entityName);
        const afterSecond = simulateAddChildrenRoute(afterFirst, entityName);

        // Content should be identical after second registration
        assert.strictEqual(
          afterFirst,
          afterSecond,
          'Registrar a mesma entidade duas vezes deve produzir conteúdo idêntico'
        );
      }),
      { numRuns: 100 }
    );
  });
});
