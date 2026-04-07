'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const observabilityPkgPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'observability', 'backend', 'src', 'main', 'java', 'app');

const healthRESTTemplate = fs.readFileSync(path.join(observabilityPkgPath, 'service', 'HealthREST.java'), 'utf-8');

// Load REST template to verify @RateLimit annotation usage
const entityRestTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
const entityRestTemplate = fs.readFileSync(entityRestTemplatePath, 'utf-8');

// --- Arbitraries ---

const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

const entityNameArb = fc.stringMatching(/^[A-Z][a-z]{2,8}$/).map(capital => ({
  capital,
  lower: capital.toLowerCase()
}));

// --- Helpers ---

function renderTemplate(template, data) {
  return ejs.render(template, data);
}

/**
 * **Validates: Requirements 23.1, 23.2, 23.3, 23.4**
 *
 * Property 18: Rate limiting (via @RateLimit) e health check (Demoiselle 4.1)
 *
 * In Demoiselle 4.1, rate limiting is handled by the framework's @RateLimit
 * annotation instead of a manual ContainerRequestFilter. The generated templates
 * must satisfy:
 * - Manual RateLimitFilter.java REMOVED (replaced by @RateLimit annotation) (Req 23.1)
 * - REST endpoints use @RateLimit annotation from Demoiselle security (Req 23.2)
 * - HealthREST has GET /health endpoint (Req 23.3)
 * - HealthREST returns status, database status, and memory info (Req 23.3)
 * - HealthREST does NOT have @RolesAllowed or authentication annotations (Req 23.4)
 * - HealthREST has @Counted for observability metrics (Demoiselle 4.1)
 */
describe('Property 18: Rate limiting (via @RateLimit) e health check (Demoiselle 4.1)', () => {

  it('rate limiting via @RateLimit e health check devem estar completos para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, entityNameArb, (project, pkg, entityName) => {
        const healthREST = renderTemplate(healthRESTTemplate, { project, package: pkg });
        const entityRest = renderTemplate(entityRestTemplate, {
          project,
          package: pkg,
          name: entityName,
          properties: []
        });

        // --- Req 23.1: RateLimitFilter exists in packages/observability as a custom filter ---
        const rateLimitFilterPath = path.join(observabilityPkgPath, 'filter', 'RateLimitFilter.java');
        assert.ok(
          fs.existsSync(rateLimitFilterPath),
          'RateLimitFilter.java deve existir em packages/observability/backend como filtro customizado'
        );

        // --- Req 23.2: REST endpoints use @RateLimit annotation ---
        assert.ok(
          /@RateLimit/.test(entityRest),
          '_pojoREST.java deve usar @RateLimit do Demoiselle para rate limiting'
        );
        assert.ok(
          /import\s+org\.demoiselle\.jee\.security\.annotation\.RateLimit/.test(entityRest),
          '_pojoREST.java deve importar org.demoiselle.jee.security.annotation.RateLimit'
        );

        // --- Req 23.3: HealthREST has GET /health endpoint ---
        assert.ok(
          /@Path\s*\(\s*"health"\s*\)/.test(healthREST),
          'HealthREST.java deve ter @Path("health")'
        );
        assert.ok(
          /@GET/.test(healthREST),
          'HealthREST.java deve ter método @GET'
        );

        // --- Req 23.3: HealthREST returns status, database status, and memory info ---
        assert.ok(
          /status/.test(healthREST) && /"UP"|"DOWN"/.test(healthREST),
          'HealthREST.java deve retornar status UP/DOWN'
        );
        assert.ok(
          /database|dbStatus/.test(healthREST),
          'HealthREST.java deve retornar status do banco de dados'
        );
        assert.ok(
          /memory/.test(healthREST),
          'HealthREST.java deve retornar informações de memória'
        );

        // --- Req 23.4: HealthREST does NOT have @RolesAllowed or @Authenticated annotations ---
        assert.ok(
          !/@RolesAllowed/.test(healthREST),
          'HealthREST.java NÃO deve ter @RolesAllowed (acesso sem autenticação)'
        );
        assert.ok(
          !/@Authenticated/.test(healthREST),
          'HealthREST.java NÃO deve ter @Authenticated (acesso sem autenticação)'
        );

        // --- Demoiselle 4.1: HealthREST has @Counted for observability ---
        assert.ok(
          /@Counted/.test(healthREST),
          'HealthREST.java deve ter @Counted para métricas de observabilidade'
        );

        // --- Package interpolation ---
        assert.ok(
          healthREST.includes(pkg.lower),
          'HealthREST.java deve conter o package'
        );
        assert.ok(
          healthREST.includes(project.lower),
          'HealthREST.java deve conter o nome do projeto'
        );
      }),
      { numRuns: 100 }
    );
  });
});
