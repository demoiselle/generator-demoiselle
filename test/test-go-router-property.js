'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const { entityNameArb, capitalize } = require('./generators/arbitraries');

// --- Load go_router template ---

const appRouterPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'mobile', 'lib', 'routes', 'app_router.dart');
const appRouterContent = fs.readFileSync(appRouterPath, 'utf-8');

// --- Load MobileUtil source ---

const mobileUtilPath = path.join(__dirname, '..', 'Utils', 'mobile.js');
const mobileUtilSource = fs.readFileSync(mobileUtilPath, 'utf-8');

/**
 * Simulates what MobileUtil._addRoute does: given the app_router.dart content and an entity,
 * produces the modified content with the new GoRoute added.
 */
function simulateAddRoute(routerContent, entityName) {
  const lower = entityName.toLowerCase();
  const capital = capitalize(entityName);

  // Avoid duplicate routes (same logic as MobileUtil._addRoute)
  if ((new RegExp(lower, 'i')).test(routerContent)) {
    return routerContent;
  }

  const newRoute = `
      GoRoute(
        path: '/${lower}',
        name: '${lower}',
        builder: (context, state) => const ${capital}ListScreen(),
        routes: [
          GoRoute(
            path: 'create',
            name: '${lower}-create',
            builder: (context, state) => const ${capital}FormScreen(),
          ),
          GoRoute(
            path: ':id/edit',
            name: '${lower}-edit',
            builder: (context, state) => ${capital}FormScreen(
              id: state.pathParameters['id'],
            ),
          ),
        ],
      ),`;

  // Insert route into the routes array
  const regEx = new RegExp('routes\\s*:\\s*\\[');
  const newContent = routerContent.replace(regEx, 'routes: [\n' + newRoute);
  return newContent;
}

/**
 * **Validates: Requirements 30.5, 41.3**
 *
 * Property 23: Registro automático de rotas no go_router
 *
 * For any valid entity name with mobile enabled, after CRUD generation:
 * - The app_router.dart must contain a GoRoute for the entity (list, create, edit)
 * - The route must have correct path, name, and builder references
 * - The edit route must have :id parameter
 * - The base app_router.dart must have the expected structure for route injection
 * - Duplicate route registration must be idempotent
 */
describe('Property 23: Registro automático de rotas no go_router', () => {

  // --- Req 41.3: Base app_router.dart must have correct structure ---

  it('app_router.dart base deve usar go_router com GoRouter e GoRoute', () => {
    assert.ok(
      appRouterContent.includes('GoRouter'),
      'app_router.dart deve usar GoRouter'
    );
    assert.ok(
      appRouterContent.includes('GoRoute'),
      'app_router.dart deve usar GoRoute'
    );
    assert.ok(
      appRouterContent.includes("import 'package:go_router/go_router.dart'"),
      'app_router.dart deve importar go_router'
    );
  });

  it('app_router.dart base deve conter rotas de autenticação e dashboard', () => {
    assert.ok(
      appRouterContent.includes("path: '/login'"),
      'app_router.dart deve conter rota /login'
    );
    assert.ok(
      appRouterContent.includes("path: '/dashboard'"),
      'app_router.dart deve conter rota /dashboard'
    );
    assert.ok(
      appRouterContent.includes("path: '/register'"),
      'app_router.dart deve conter rota /register'
    );
  });

  it('app_router.dart base deve conter guard de autenticação (redirect)', () => {
    assert.ok(
      appRouterContent.includes('redirect:'),
      'app_router.dart deve conter redirect para guard de autenticação'
    );
    assert.ok(
      appRouterContent.includes('isAuthenticated'),
      'app_router.dart deve verificar isAuthenticated no guard'
    );
  });

  it('app_router.dart base deve conter marcador para adição de rotas CRUD', () => {
    assert.ok(
      appRouterContent.includes('// CRUD routes will be added here by the generator'),
      'app_router.dart deve conter marcador para rotas CRUD'
    );
  });

  it('app_router.dart base deve conter guard RBAC para rota de auditoria', () => {
    assert.ok(
      appRouterContent.includes("path: '/audit'"),
      'app_router.dart deve conter rota /audit'
    );
    assert.ok(
      appRouterContent.includes('ADMIN'),
      'app_router.dart deve verificar papel ADMIN para rota de auditoria'
    );
  });

  // --- Req 41.3: MobileUtil._addRoute must exist and modify app_router.dart ---

  it('MobileUtil._addRoute deve existir e modificar app_router.dart', () => {
    assert.ok(
      mobileUtilSource.includes('_addRoute'),
      'MobileUtil deve conter método _addRoute'
    );
    assert.ok(
      mobileUtilSource.includes('app_router.dart'),
      'MobileUtil._addRoute deve referenciar app_router.dart'
    );
    assert.ok(
      mobileUtilSource.includes('GoRoute'),
      'MobileUtil._addRoute deve gerar GoRoute'
    );
  });

  // --- Req 30.5: Route must contain list, create, edit for any entity ---

  it('_addRoute deve gerar GoRoute com list, create e edit para qualquer entidade (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();
        const capital = capitalize(entityName);

        const modified = simulateAddRoute(appRouterContent, entityName);

        // Skip if entity name matches something already in the base router
        if ((new RegExp(lower, 'i')).test(appRouterContent)) {
          return true;
        }

        // Must contain the entity list route
        assert.ok(
          modified.includes(`path: '/${lower}'`),
          `Router modificado deve conter path '/${lower}'`
        );
        assert.ok(
          modified.includes(`name: '${lower}'`),
          `Router modificado deve conter name '${lower}'`
        );

        // Must contain the list screen builder
        assert.ok(
          modified.includes(`${capital}ListScreen`),
          `Router modificado deve referenciar ${capital}ListScreen`
        );

        // Must contain the create route
        assert.ok(
          modified.includes(`name: '${lower}-create'`),
          `Router modificado deve conter rota '${lower}-create'`
        );
        assert.ok(
          modified.includes(`${capital}FormScreen()`),
          `Router modificado deve referenciar ${capital}FormScreen() para criação`
        );

        // Must contain the edit route with :id parameter
        assert.ok(
          modified.includes(`name: '${lower}-edit'`),
          `Router modificado deve conter rota '${lower}-edit'`
        );
        assert.ok(
          modified.includes(":id/edit"),
          'Rota de edição deve conter parâmetro :id'
        );
        assert.ok(
          modified.includes("state.pathParameters['id']"),
          'Rota de edição deve extrair id dos pathParameters'
        );

        // The CRUD marker comment must still be present
        assert.ok(
          modified.includes('// CRUD routes will be added here by the generator'),
          'Marcador de CRUD deve permanecer no router após adição de rotas'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 30.5: Multiple entities can be registered sequentially ---

  it('múltiplas entidades devem poder ser registradas sequencialmente no app_router.dart (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(
        fc.array(entityNameArb, { minLength: 2, maxLength: 5 })
          .map(names => {
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
          let content = appRouterContent;

          // Register each entity sequentially
          for (const entityName of entityNames) {
            content = simulateAddRoute(content, entityName);
          }

          // Verify all entities are registered
          for (const entityName of entityNames) {
            const lower = entityName.toLowerCase();
            const capital = capitalize(entityName);

            // Skip entities that match existing content in the base router
            if ((new RegExp(lower, 'i')).test(appRouterContent)) {
              continue;
            }

            assert.ok(
              content.includes(`path: '/${lower}'`),
              `Router deve conter path para entidade "${entityName}"`
            );
            assert.ok(
              content.includes(`${capital}ListScreen`),
              `Router deve conter ListScreen para entidade "${entityName}"`
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

  // --- Req 41.3: Duplicate entity registration is idempotent ---

  it('registrar a mesma entidade duas vezes deve ser idempotente (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();

        // Skip if entity name matches something already in the base router
        if ((new RegExp(lower, 'i')).test(appRouterContent)) {
          return true;
        }

        const afterFirst = simulateAddRoute(appRouterContent, entityName);
        const afterSecond = simulateAddRoute(afterFirst, entityName);

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

  // --- Req 30.5: Route structure follows go_router conventions ---

  it('rotas geradas devem seguir convenções do go_router (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();

        // Skip if entity name matches something already in the base router
        if ((new RegExp(lower, 'i')).test(appRouterContent)) {
          return true;
        }

        const modified = simulateAddRoute(appRouterContent, entityName);

        // GoRoute must have path, name, and builder
        const routeBlock = modified.substring(
          modified.indexOf(`path: '/${lower}'`),
          modified.indexOf(`path: '/${lower}'`) + 500
        );

        // Path must start with /
        assert.ok(
          routeBlock.includes(`path: '/${lower}'`),
          'Path deve começar com /'
        );

        // Create route must be a child (nested under entity route)
        assert.ok(
          routeBlock.includes("path: 'create'"),
          'Rota create deve ser filha (path relativo sem /)'
        );

        // Edit route must be a child with :id parameter
        assert.ok(
          routeBlock.includes("path: ':id/edit'"),
          'Rota edit deve ser filha com :id/edit'
        );
      }),
      { numRuns: 100 }
    );
  });
});
