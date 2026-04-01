'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const basePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'java', 'app');
const resourcesPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'resources');
const entityTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app');

const roleTemplate = fs.readFileSync(path.join(basePath, 'entity', 'Role.java'), 'utf-8');
const userTemplate = fs.readFileSync(path.join(basePath, 'entity', 'User.java'), 'utf-8');
const jwtTokenProviderTemplate = fs.readFileSync(path.join(basePath, 'security', 'JwtTokenProvider.java'), 'utf-8');
const importSql = fs.readFileSync(path.join(resourcesPath, 'import.sql'), 'utf-8');
const pojoRestTemplate = fs.readFileSync(path.join(entityTemplatePath, 'service', '_pojoREST.java'), 'utf-8');

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
 * **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**
 *
 * Property 13: RBAC no token JWT e nos endpoints
 *
 * For any valid project name, package name, and entity name, the generated RBAC
 * system must be complete:
 * - Role.java entity exists with `id` and `name` fields (Req 15.1)
 * - _pojoREST.java template contains `@RolesAllowed` annotation (Req 15.2)
 * - import.sql contains ADMIN and USER role inserts (Req 15.3)
 * - JwtTokenProvider includes roles in the token payload (claim "roles") (Req 15.5)
 * - _pojoREST.java imports `jakarta.annotation.security.RolesAllowed`
 */
describe('Property 13: RBAC no token JWT e nos endpoints', () => {

  it('sistema RBAC deve estar completo para qualquer projeto, package e entidade válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, entityNameArb, (project, pkg, entityName) => {
        // Render Role.java
        const role = renderTemplate(roleTemplate, { project, package: pkg });

        // Render User.java
        const user = renderTemplate(userTemplate, { project, package: pkg });

        // Render JwtTokenProvider.java
        const jwtTokenProvider = renderTemplate(jwtTokenProviderTemplate, { project, package: pkg });

        // Render _pojoREST.java with entity name and minimal properties
        const pojoRest = renderTemplate(pojoRestTemplate, {
          project,
          package: pkg,
          name: entityName,
          properties: []
        });

        // --- Req 15.1: Role.java entity exists with id and name fields ---
        assert.ok(
          /private\s+Long\s+id\s*;/.test(role),
          'Role.java deve conter campo id do tipo Long'
        );
        assert.ok(
          /private\s+String\s+name\s*;/.test(role),
          'Role.java deve conter campo name do tipo String'
        );
        assert.ok(
          /@Entity/.test(role),
          'Role.java deve ter anotação @Entity'
        );
        assert.ok(
          /@Id/.test(role),
          'Role.java deve ter anotação @Id no campo id'
        );

        // Role.java must have correct package interpolation
        assert.ok(
          role.includes(`package ${pkg.lower}.${project.lower}.entity`),
          'Role.java deve conter o package correto'
        );

        // --- Req 15.1: User.java has ManyToMany with Role ---
        assert.ok(
          /@ManyToMany/.test(user),
          'User.java deve conter @ManyToMany para relacionamento com Role'
        );
        assert.ok(
          /Set<Role>/.test(user),
          'User.java deve conter Set<Role> para os papéis'
        );
        assert.ok(
          /user_role/.test(user),
          'User.java deve referenciar tabela de junção user_role'
        );

        // --- Req 15.2: _pojoREST.java contains @RolesAllowed annotation ---
        assert.ok(
          /@RolesAllowed/.test(pojoRest),
          '_pojoREST.java deve conter anotação @RolesAllowed'
        );
        assert.ok(
          /@RolesAllowed\s*\(\s*\{[^}]*"ADMIN"[^}]*\}\s*\)/.test(pojoRest),
          '_pojoREST.java @RolesAllowed deve incluir papel ADMIN'
        );
        assert.ok(
          /@RolesAllowed\s*\(\s*\{[^}]*"USER"[^}]*\}\s*\)/.test(pojoRest),
          '_pojoREST.java @RolesAllowed deve incluir papel USER'
        );

        // _pojoREST.java must import RolesAllowed from jakarta
        assert.ok(
          /import\s+jakarta\.annotation\.security\.RolesAllowed\s*;/.test(pojoRest),
          '_pojoREST.java deve importar jakarta.annotation.security.RolesAllowed'
        );

        // --- Req 15.3: import.sql contains ADMIN and USER role inserts ---
        assert.ok(
          /INSERT\s+INTO\s+app_role\b.*'ADMIN'/.test(importSql),
          'import.sql deve conter INSERT de papel ADMIN'
        );
        assert.ok(
          /INSERT\s+INTO\s+app_role\b.*'USER'/.test(importSql),
          'import.sql deve conter INSERT de papel USER'
        );

        // --- Req 15.5: JwtTokenProvider includes roles in the token payload ---
        assert.ok(
          /\.claim\s*\(\s*"roles"/.test(jwtTokenProvider),
          'JwtTokenProvider deve incluir claim "roles" no token JWT'
        );

        // Verify roles claim is present in both generateToken and refreshToken
        assert.ok(
          /generateToken\s*\(/.test(jwtTokenProvider),
          'JwtTokenProvider deve conter método generateToken'
        );
        assert.ok(
          /refreshToken\s*\(/.test(jwtTokenProvider),
          'JwtTokenProvider deve conter método refreshToken'
        );

        // The generateToken method should accept roles parameter
        assert.ok(
          /generateToken\s*\([^)]*List<String>\s+roles[^)]*\)/.test(jwtTokenProvider),
          'JwtTokenProvider.generateToken deve aceitar parâmetro List<String> roles'
        );
      }),
      { numRuns: 100 }
    );
  });
});
