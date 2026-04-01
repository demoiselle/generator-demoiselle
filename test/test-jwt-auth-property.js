'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const basePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'java', 'app');

const jwtTokenProviderTemplate = fs.readFileSync(path.join(basePath, 'security', 'JwtTokenProvider.java'), 'utf-8');
const jwtAuthFilterTemplate = fs.readFileSync(path.join(basePath, 'security', 'JwtAuthFilter.java'), 'utf-8');
const passwordEncoderTemplate = fs.readFileSync(path.join(basePath, 'security', 'PasswordEncoder.java'), 'utf-8');
const tokenResponseTemplate = fs.readFileSync(path.join(basePath, 'security', 'TokenResponse.java'), 'utf-8');
const authRestTemplate = fs.readFileSync(path.join(basePath, 'service', 'AuthREST.java'), 'utf-8');
const userTemplate = fs.readFileSync(path.join(basePath, 'entity', 'User.java'), 'utf-8');

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
 * Property 12: Completude do sistema de autenticação JWT
 *
 * For any valid project name and package name, the generated JWT authentication
 * system templates must be complete:
 * - JwtTokenProvider contains generateToken, refreshToken, validateToken methods
 * - JwtTokenProvider uses jjwt library (contains io.jsonwebtoken)
 * - JwtAuthFilter implements ContainerRequestFilter and has @Provider annotation
 * - PasswordEncoder uses BCrypt (contains BCrypt or jbcrypt)
 * - AuthREST contains all 6 endpoints: /auth/login, /auth/refresh, /auth/register,
 *   /auth/confirm, /auth/forgot-password, /auth/reset-password
 * - User.java contains emailVerified, verificationToken, resetToken, resetTokenExpiry fields
 * - User.java contains @ManyToMany with Role
 */
describe('Property 12: Completude do sistema de autenticação JWT', () => {

  it('sistema de autenticação JWT deve estar completo para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const jwtTokenProvider = renderTemplate(jwtTokenProviderTemplate, project, pkg);
        const jwtAuthFilter = renderTemplate(jwtAuthFilterTemplate, project, pkg);
        const passwordEncoder = renderTemplate(passwordEncoderTemplate, project, pkg);
        const tokenResponse = renderTemplate(tokenResponseTemplate, project, pkg);
        const authRest = renderTemplate(authRestTemplate, project, pkg);
        const user = renderTemplate(userTemplate, project, pkg);

        // --- Req 12.1, 12.2: JwtTokenProvider must have generateToken, refreshToken, validateToken ---
        assert.ok(
          /generateToken\s*\(/.test(jwtTokenProvider),
          'JwtTokenProvider deve conter método generateToken'
        );
        assert.ok(
          /refreshToken\s*\(/.test(jwtTokenProvider),
          'JwtTokenProvider deve conter método refreshToken'
        );
        assert.ok(
          /validateToken\s*\(/.test(jwtTokenProvider),
          'JwtTokenProvider deve conter método validateToken'
        );

        // JwtTokenProvider must use jjwt library
        assert.ok(
          /io\.jsonwebtoken/.test(jwtTokenProvider),
          'JwtTokenProvider deve usar biblioteca jjwt (io.jsonwebtoken)'
        );

        // --- Req 12.6: JwtAuthFilter implements ContainerRequestFilter with @Provider ---
        assert.ok(
          /implements\s+ContainerRequestFilter/.test(jwtAuthFilter),
          'JwtAuthFilter deve implementar ContainerRequestFilter'
        );
        assert.ok(
          /@Provider/.test(jwtAuthFilter),
          'JwtAuthFilter deve ter anotação @Provider'
        );

        // --- Req 12.6: PasswordEncoder uses BCrypt ---
        assert.ok(
          /BCrypt/.test(passwordEncoder),
          'PasswordEncoder deve usar BCrypt'
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

        // --- TokenResponse has token and expiresIn fields ---
        assert.ok(
          /token/.test(tokenResponse) && /expiresIn/.test(tokenResponse),
          'TokenResponse deve conter campos token e expiresIn'
        );

        // --- Package interpolation ---
        assert.ok(
          jwtTokenProvider.includes(pkg.lower),
          'JwtTokenProvider deve conter o package'
        );
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
