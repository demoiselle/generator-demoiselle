'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const authPkgPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'auth', 'backend', 'src', 'main', 'java', 'app');
const resourcesPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'resources');
const entityTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app');

const roleTemplate = fs.readFileSync(path.join(authPkgPath, 'entity', 'Role.java'), 'utf-8');
const userTemplate = fs.readFileSync(path.join(authPkgPath, 'entity', 'User.java'), 'utf-8');
const authRestTemplate = fs.readFileSync(path.join(authPkgPath, 'service', 'AuthREST.java'), 'utf-8');
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
 * Property 13: RBAC via Demoiselle 4.1 security annotations e nos endpoints
 *
 * For any valid project name, package name, and entity name, the generated RBAC
 * system must be complete:
 * - Role.java entity exists with `id` and `name` fields (Req 15.1)
 * - _pojoREST.java template contains `@Authenticated` and `@RequiredAnyRole` annotations (Req 15.2)
 * - import.sql contains ADMIN and USER role inserts (Req 15.3)
 * - AuthREST uses SecurityContext.setUser with DemoiselleUser including roles (Req 15.5)
 * - _pojoREST.java imports Demoiselle security annotations
 */
describe('Property 13: RBAC via Demoiselle 4.1 security annotations e nos endpoints', () => {

  it('sistema RBAC deve estar completo usando APIs nativas Demoiselle 4.1 para qualquer projeto, package e entidade válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, entityNameArb, (project, pkg, entityName) => {
        // Render Role.java
        const role = renderTemplate(roleTemplate, { project, package: pkg });

        // Render User.java
        const user = renderTemplate(userTemplate, { project, package: pkg });

        // Render AuthREST.java
        const authRest = renderTemplate(authRestTemplate, { project, package: pkg });

        // Render _pojoREST.java with entity name and minimal properties
        const pojoRest = renderTemplate(pojoRestTemplate, {
          project,
          package: pkg,
          name: entityName,
          properties: [],
          packages: ['auth']
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

        // --- Req 15.2: _pojoREST.java contains @Authenticated and @RequiredAnyRole annotations ---
        assert.ok(
          /@Authenticated/.test(pojoRest),
          '_pojoREST.java deve conter anotação @Authenticated'
        );
        assert.ok(
          /@RequiredAnyRole/.test(pojoRest),
          '_pojoREST.java deve conter anotação @RequiredAnyRole'
        );
        assert.ok(
          /@RequiredAnyRole\s*\(\s*\{[^}]*"ADMIN"[^}]*\}\s*\)/.test(pojoRest),
          '_pojoREST.java @RequiredAnyRole deve incluir papel ADMIN'
        );
        assert.ok(
          /@RequiredAnyRole\s*\(\s*\{[^}]*"USER"[^}]*\}\s*\)/.test(pojoRest),
          '_pojoREST.java @RequiredAnyRole deve incluir papel USER'
        );

        // _pojoREST.java must import Demoiselle security annotations
        assert.ok(
          /import\s+org\.demoiselle\.jee\.security\.annotation\.Authenticated\s*;/.test(pojoRest),
          '_pojoREST.java deve importar org.demoiselle.jee.security.annotation.Authenticated'
        );
        assert.ok(
          /import\s+org\.demoiselle\.jee\.security\.annotation\.RequiredAnyRole\s*;/.test(pojoRest),
          '_pojoREST.java deve importar org.demoiselle.jee.security.annotation.RequiredAnyRole'
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

        // --- Req 15.5: AuthREST uses SecurityContext.setUser with DemoiselleUser including roles ---
        assert.ok(
          /securityContext\.setUser/.test(authRest),
          'AuthREST deve usar securityContext.setUser para definir o usuário autenticado'
        );
        assert.ok(
          /addRole/.test(authRest),
          'AuthREST deve adicionar roles ao DemoiselleUser via addRole'
        );

        // AuthREST must use Demoiselle SecurityContext
        assert.ok(
          /import\s+org\.demoiselle\.jee\.core\.api\.security\.SecurityContext/.test(authRest),
          'AuthREST deve importar SecurityContext do Demoiselle'
        );
      }),
      { numRuns: 100 }
    );
  });
});
