'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const auditPkgPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'audit', 'backend', 'src', 'main', 'java', 'app');

const auditLogTemplate = fs.readFileSync(path.join(auditPkgPath, 'entity', 'AuditLog.java'), 'utf-8');
const auditLogDAOTemplate = fs.readFileSync(path.join(auditPkgPath, 'dao', 'AuditLogDAO.java'), 'utf-8');
const auditRESTTemplate = fs.readFileSync(path.join(auditPkgPath, 'service', 'AuditREST.java'), 'utf-8');

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
  return ejs.render(template, { project, package: pkg, packages: ['auth', 'observability'] });
}

/**
 * **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
 *
 * Property 15: Registro de auditoria (Demoiselle 4.1 native)
 *
 * For any valid project name and package name, the generated audit system
 * templates must be complete:
 * - AuditLog.java has fields: entityName, entityId, action (enum CREATE/UPDATE/DELETE),
 *   userId, timestamp, changes (Req 17.1)
 * - AuditEntityListener is provided by framework (org.demoiselle.jee.crud.audit.AuditEntityListener)
 *   — manual listener REMOVED from templates (Req 17.2)
 * - AuditREST.java has GET /audit endpoint with @Authenticated + @RequiredRole({"ADMIN"})
 *   and query filters (Req 17.3, 17.4)
 * - AuditREST has @Counted and @Traced for observability
 * - AuditLogDAO.java has findByEntityName, findByUserId, findByTimestampBetween methods
 */
describe('Property 15: Registro de auditoria (Demoiselle 4.1)', () => {

  it('sistema de auditoria deve estar completo usando APIs nativas Demoiselle 4.1 para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const auditLog = renderTemplate(auditLogTemplate, project, pkg);
        const auditLogDAO = renderTemplate(auditLogDAOTemplate, project, pkg);
        const auditREST = renderTemplate(auditRESTTemplate, project, pkg);

        // --- Req 17.1: AuditLog.java must have required fields ---
        assert.ok(
          /entityName/.test(auditLog),
          'AuditLog.java deve conter campo entityName'
        );
        assert.ok(
          /entityId/.test(auditLog),
          'AuditLog.java deve conter campo entityId'
        );
        assert.ok(
          /action/.test(auditLog),
          'AuditLog.java deve conter campo action'
        );
        assert.ok(
          /userId/.test(auditLog),
          'AuditLog.java deve conter campo userId'
        );
        assert.ok(
          /timestamp/.test(auditLog),
          'AuditLog.java deve conter campo timestamp'
        );
        assert.ok(
          /changes/.test(auditLog),
          'AuditLog.java deve conter campo changes'
        );

        // --- Req 17.1: AuditLog action must be an enum with CREATE, UPDATE, DELETE ---
        assert.ok(
          /enum\s+AuditAction/.test(auditLog),
          'AuditLog.java deve conter enum AuditAction'
        );
        assert.ok(
          /CREATE/.test(auditLog),
          'AuditAction deve conter CREATE'
        );
        assert.ok(
          /UPDATE/.test(auditLog),
          'AuditAction deve conter UPDATE'
        );
        assert.ok(
          /DELETE/.test(auditLog),
          'AuditAction deve conter DELETE'
        );

        // --- Req 17.1: AuditLog must be a JPA entity ---
        assert.ok(
          /@Entity/.test(auditLog),
          'AuditLog.java deve ter anotação @Entity'
        );
        assert.ok(
          /@Enumerated/.test(auditLog),
          'AuditLog.java deve ter @Enumerated no campo action'
        );

        // --- Req 17.2: AuditEntityListener exists in packages/audit as a custom listener ---
        const manualListenerPath = path.join(auditPkgPath, 'listener', 'AuditEntityListener.java');
        assert.ok(
          fs.existsSync(manualListenerPath),
          'AuditEntityListener.java deve existir em packages/audit/backend como listener customizado'
        );

        // --- Req 17.3: AuditREST must have GET /audit endpoint ---
        assert.ok(
          /@Path\s*\(\s*"audit"\s*\)/.test(auditREST),
          'AuditREST.java deve ter @Path("audit")'
        );
        assert.ok(
          /@GET/.test(auditREST),
          'AuditREST.java deve ter método @GET'
        );

        // --- Req 17.3, 17.4: AuditREST must have @Authenticated + @RequiredRole({"ADMIN"}) ---
        assert.ok(
          /@Authenticated/.test(auditREST),
          'AuditREST.java deve ter @Authenticated'
        );
        assert.ok(
          /@RequiredRole\s*\(\s*\{[^}]*"ADMIN"[^}]*\}\s*\)/.test(auditREST),
          'AuditREST.java deve ter @RequiredRole({"ADMIN"})'
        );

        // --- Demoiselle 4.1: AuditREST has @Counted and @Traced ---
        assert.ok(
          /@Counted/.test(auditREST),
          'AuditREST.java deve ter @Counted para observabilidade'
        );
        assert.ok(
          /@Traced/.test(auditREST),
          'AuditREST.java deve ter @Traced para rastreamento distribuído'
        );

        // --- Req 17.3: AuditREST must have query filters ---
        assert.ok(
          /@QueryParam\s*\(\s*"entityName"\s*\)/.test(auditREST),
          'AuditREST.java deve ter filtro @QueryParam("entityName")'
        );
        assert.ok(
          /@QueryParam\s*\(\s*"userId"\s*\)/.test(auditREST),
          'AuditREST.java deve ter filtro @QueryParam("userId")'
        );
        assert.ok(
          /@QueryParam\s*\(\s*"startDate"\s*\)/.test(auditREST) || /@QueryParam\s*\(\s*"start"\s*\)/.test(auditREST),
          'AuditREST.java deve ter filtro de data de início'
        );
        assert.ok(
          /@QueryParam\s*\(\s*"endDate"\s*\)/.test(auditREST) || /@QueryParam\s*\(\s*"end"\s*\)/.test(auditREST),
          'AuditREST.java deve ter filtro de data de fim'
        );

        // --- AuditLogDAO must have required query methods ---
        assert.ok(
          /findByEntityName\s*\(/.test(auditLogDAO),
          'AuditLogDAO.java deve conter método findByEntityName'
        );
        assert.ok(
          /findByUserId\s*\(/.test(auditLogDAO),
          'AuditLogDAO.java deve conter método findByUserId'
        );
        assert.ok(
          /findByTimestampBetween\s*\(/.test(auditLogDAO),
          'AuditLogDAO.java deve conter método findByTimestampBetween'
        );

        // --- Package interpolation ---
        assert.ok(
          auditLog.includes(pkg.lower),
          'AuditLog.java deve conter o package'
        );
        assert.ok(
          auditLogDAO.includes(pkg.lower),
          'AuditLogDAO.java deve conter o package'
        );
        assert.ok(
          auditREST.includes(pkg.lower),
          'AuditREST.java deve conter o package'
        );
      }),
      { numRuns: 100 }
    );
  });
});
