'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const basePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'java', 'app');

const rateLimitFilterTemplate = fs.readFileSync(path.join(basePath, 'filter', 'RateLimitFilter.java'), 'utf-8');
const healthRESTTemplate = fs.readFileSync(path.join(basePath, 'service', 'HealthREST.java'), 'utf-8');

// --- Arbitraries ---

const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

// --- Helpers ---

function renderTemplate(template, project, pkg) {
  return ejs.render(template, { project, package: pkg });
}

/**
 * **Validates: Requirements 23.1, 23.2, 23.3, 23.4**
 *
 * Property 18: Rate limiting e health check
 *
 * For any valid project name and package name, the generated rate limiting
 * and health check templates must satisfy:
 * - RateLimitFilter implements ContainerRequestFilter with @Provider (Req 23.1)
 * - RateLimitFilter returns HTTP 429 with Retry-After header (Req 23.2)
 * - RateLimitFilter has configurable requests-per-minute limit (Req 23.1)
 * - HealthREST has GET /health endpoint (Req 23.3)
 * - HealthREST returns status, database status, and memory info (Req 23.3)
 * - HealthREST does NOT have @RolesAllowed or authentication annotations (Req 23.4)
 */
describe('Property 18: Rate limiting e health check', () => {

  it('rate limiting e health check devem estar completos para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const rateLimitFilter = renderTemplate(rateLimitFilterTemplate, project, pkg);
        const healthREST = renderTemplate(healthRESTTemplate, project, pkg);

        // --- Req 23.1: RateLimitFilter implements ContainerRequestFilter with @Provider ---
        assert.ok(
          /implements\s+ContainerRequestFilter/.test(rateLimitFilter),
          'RateLimitFilter.java deve implementar ContainerRequestFilter'
        );
        assert.ok(
          /@Provider/.test(rateLimitFilter),
          'RateLimitFilter.java deve ter anotação @Provider'
        );
        assert.ok(
          /import\s+jakarta\.ws\.rs\.container\.ContainerRequestFilter/.test(rateLimitFilter),
          'RateLimitFilter.java deve importar jakarta.ws.rs.container.ContainerRequestFilter'
        );
        assert.ok(
          /import\s+jakarta\.ws\.rs\.ext\.Provider/.test(rateLimitFilter),
          'RateLimitFilter.java deve importar jakarta.ws.rs.ext.Provider'
        );

        // --- Req 23.1: RateLimitFilter has configurable requests-per-minute limit ---
        assert.ok(
          /requests-per-minute|requests\.per\.minute|REQUESTS_PER_MINUTE/i.test(rateLimitFilter),
          'RateLimitFilter.java deve ter limite de requisições por minuto configurável'
        );

        // --- Req 23.2: RateLimitFilter returns HTTP 429 with Retry-After header ---
        assert.ok(
          /429/.test(rateLimitFilter),
          'RateLimitFilter.java deve retornar HTTP 429'
        );
        assert.ok(
          /Retry-After/.test(rateLimitFilter),
          'RateLimitFilter.java deve incluir header Retry-After'
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

        // --- Req 23.4: HealthREST does NOT have @RolesAllowed or authentication annotations ---
        assert.ok(
          !/@RolesAllowed/.test(healthREST),
          'HealthREST.java NÃO deve ter @RolesAllowed (acesso sem autenticação)'
        );
        assert.ok(
          !/@Authenticated/.test(healthREST),
          'HealthREST.java NÃO deve ter @Authenticated (acesso sem autenticação)'
        );

        // --- Package interpolation ---
        assert.ok(
          rateLimitFilter.includes(pkg.lower),
          'RateLimitFilter.java deve conter o package'
        );
        assert.ok(
          healthREST.includes(pkg.lower),
          'HealthREST.java deve conter o package'
        );
        assert.ok(
          rateLimitFilter.includes(project.lower),
          'RateLimitFilter.java deve conter o nome do projeto'
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
