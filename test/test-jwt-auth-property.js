'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const authPkgPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'auth', 'backend', 'src', 'main', 'java', 'app');

const authRestTemplate = fs.readFileSync(path.join(authPkgPath, 'service', 'AuthREST.java'), 'utf-8');
const userTemplate = fs.readFileSync(path.join(authPkgPath, 'entity', 'User.java'), 'utf-8');

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
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.6, 13.1, 13.3, 13.4, 14.1, 14.2, 14.4**
 *
 * Property 12: Completude do sistema de autenticação JWT (Demoiselle 4.1 native)
 *
 * For any valid project name and package name, the generated JWT authentication
 * system templates must be complete using Demoiselle 4.1 native APIs:
 * - AuthREST uses SecurityContext from org.demoiselle.jee.core.api.security
 * - AuthREST uses TokenManager for JWT token creation/validation
 * - AuthREST uses BruteForceGuard for brute force protection
 * - AuthREST uses DemoiselleUser / DemoiselleUserImpl for user representation
 * - AuthREST contains all 6 endpoints: /auth/login, /auth/refresh, /auth/register,
 *   /auth/confirm, /auth/forgot-password, /auth/reset-password
 * - AuthREST has @Counted for observability
 * - AuthREST has @RateLimit on login endpoint
 * - User.java contains emailVerified, verificationToken, resetToken, resetTokenExpiry fields
 * - User.java contains @ManyToMany with Role
 */
describe('Property 12: Completude do sistema de autenticação JWT (Demoiselle 4.1)', () => {

  it('sistema de autenticação JWT deve usar APIs nativas Demoiselle 4.1 para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const authRest = renderTemplate(authRestTemplate, project, pkg);
        const user = renderTemplate(userTemplate, project, pkg);

        // --- AuthREST uses Demoiselle SecurityContext ---
        assert.ok(
          /import\s+org\.demoiselle\.jee\.core\.api\.security\.SecurityContext/.test(authRest),
          'AuthREST deve importar SecurityContext do Demoiselle'
        );

        // --- AuthREST uses TokenManager ---
        assert.ok(
          /import\s+org\.demoiselle\.jee\.core\.api\.security\.TokenManager/.test(authRest),
          'AuthREST deve importar TokenManager do Demoiselle'
        );

        // --- AuthREST uses DemoiselleUser ---
        assert.ok(
          /import\s+org\.demoiselle\.jee\.core\.api\.security\.DemoiselleUser/.test(authRest),
          'AuthREST deve importar DemoiselleUser do Demoiselle'
        );

        // --- AuthREST uses BruteForceGuard ---
        assert.ok(
          /import\s+org\.demoiselle\.jee\.security\.bruteforce\.BruteForceGuard/.test(authRest),
          'AuthREST deve importar BruteForceGuard do Demoiselle'
        );

        // --- AuthREST uses DemoiselleUserImpl ---
        assert.ok(
          /DemoiselleUserImpl/.test(authRest),
          'AuthREST deve usar DemoiselleUserImpl para representação de usuário'
        );

        // --- AuthREST has @Counted ---
        assert.ok(
          /@Counted/.test(authRest),
          'AuthREST deve ter @Counted para observabilidade'
        );

        // --- AuthREST has @RateLimit on login ---
        assert.ok(
          /@RateLimit/.test(authRest),
          'AuthREST deve ter @RateLimit no endpoint de login'
        );

        // --- AuthREST does NOT use manual JwtTokenProvider ---
        assert.ok(
          !/JwtTokenProvider/.test(authRest),
          'AuthREST NÃO deve usar JwtTokenProvider manual (substituído por TokenManager)'
        );

        // --- AuthREST does NOT use manual PasswordEncoder ---
        assert.ok(
          !/PasswordEncoder/.test(authRest),
          'AuthREST NÃO deve usar PasswordEncoder manual'
        );

        // --- AuthREST does NOT use manual TokenResponse ---
        assert.ok(
          !/TokenResponse/.test(authRest),
          'AuthREST NÃO deve usar TokenResponse manual'
        );

        // --- Req 12.1: AuthREST contains /auth/login endpoint ---
        assert.ok(
          /@Path\s*\(\s*"login"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/login'
        );

        // --- Req 12.2: AuthREST contains /auth/refresh endpoint ---
        assert.ok(
          /@Path\s*\(\s*"refresh"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/refresh'
        );

        // --- Req 13.1: AuthREST contains /auth/register endpoint ---
        assert.ok(
          /@Path\s*\(\s*"register"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/register'
        );

        // --- Req 13.3: AuthREST contains /auth/confirm endpoint ---
        assert.ok(
          /@Path\s*\(\s*"confirm\/\{token\}"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/confirm/{token}'
        );

        // --- Req 14.1: AuthREST contains /auth/forgot-password endpoint ---
        assert.ok(
          /@Path\s*\(\s*"forgot-password"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/forgot-password'
        );

        // --- Req 14.2: AuthREST contains /auth/reset-password endpoint ---
        assert.ok(
          /@Path\s*\(\s*"reset-password"\s*\)/.test(authRest),
          'AuthREST deve conter endpoint /auth/reset-password'
        );

        // --- AuthREST base path is "auth" ---
        assert.ok(
          /@Path\s*\(\s*"auth"\s*\)/.test(authRest),
          'AuthREST deve ter @Path("auth") como base'
        );

        // --- Req 13.1: User.java contains emailVerified field ---
        assert.ok(
          /emailVerified/.test(user),
          'User.java deve conter campo emailVerified'
        );

        // --- Req 13.3: User.java contains verificationToken field ---
        assert.ok(
          /verificationToken/.test(user),
          'User.java deve conter campo verificationToken'
        );

        // --- Req 14.1: User.java contains resetToken field ---
        assert.ok(
          /resetToken/.test(user),
          'User.java deve conter campo resetToken'
        );

        // --- Req 14.2: User.java contains resetTokenExpiry field ---
        assert.ok(
          /resetTokenExpiry/.test(user),
          'User.java deve conter campo resetTokenExpiry'
        );

        // --- User.java contains @ManyToMany with Role ---
        assert.ok(
          /@ManyToMany/.test(user),
          'User.java deve conter @ManyToMany'
        );
        assert.ok(
          /Role/.test(user),
          'User.java deve referenciar Role'
        );

        // --- Package interpolation ---
        assert.ok(
          authRest.includes(pkg.lower),
          'AuthREST deve conter o package'
        );
        assert.ok(
          user.includes(pkg.lower),
          'User.java deve conter o package'
        );
      }),
      { numRuns: 100 }
    );
  });
});
