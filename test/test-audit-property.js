'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const basePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'backend', 'src', 'main', 'java', 'app');

const auditLogTemplate = fs.readFileSync(path.join(basePath, 'entity', 'AuditLog.java'), 'utf-8');
const auditLogDAOTemplate = fs.readFileSync(path.join(basePath, 'dao', 'AuditLogDAO.java'), 'utf-8');
const auditEntityListenerTemplate = fs.readFileSync(path.join(basePath, 'listener', 'AuditEntityListener.java'), 'utf-8');
const auditRESTTemplate = fs.readFileSync(path.join(basePath, 'service', 'AuditREST.java'), 'utf-8');

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
 * **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
 *
 * Property 15: Registro de auditoria automático
 *
 * For any valid project name and package name, the generated audit system
 * templates must be complete:
 * - AuditLog.java has fields: entityName, entityId, action (enum CREATE/UPDATE/DELETE),
 *   userId, timestamp, changes (Req 17.1)
 * - AuditEntityListener.java has @PrePersist, @PreUpdate, @PreRemove callbacks (Req 17.2)
 * - AuditREST.java has GET /audit endpoint with @RolesAllowed("ADMIN") and query filters (Req 17.3, 17.4)
 * - AuditLogDAO.java has findByEntityName, findByUserId, findByTimestampBetween methods
 */
describe('Property 15: Registro de auditoria automático', () => {

  it('sistema de auditoria deve estar completo para qualquer projeto e package válidos', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(projectArb, packageArb, (project, pkg) => {
        const auditLog = renderTemplate(auditLogTemplate, project, pkg);
        const auditLogDAO = renderTemplate(auditLogDAOTemplate, project, pkg);
        const auditEntityListener = renderTemplate(auditEntityListenerTemplate, project, pkg);
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

        // --- Req 17.2: AuditEntityListener must have JPA lifecycle callbacks ---
        assert.ok(
          /@PrePersist/.test(auditEntityListener),
          'AuditEntityListener.java deve ter @PrePersist'
        );
        assert.ok(
          /@PreUpdate/.test(auditEntityListener),
          'AuditEntityListener.java deve ter @PreUpdate'
        );
        assert.ok(
          /@PreRemove/.test(auditEntityListener),
          'AuditEntityListener.java deve ter @PreRemove'
        );

        // --- Req 17.2: AuditEntityListener must create AuditLog entries ---
        assert.ok(
          /AuditLog/.test(auditEntityListener),
          'AuditEntityListener.java deve referenciar AuditLog'
        );
        assert.ok(
          /AuditLogDAO/.test(auditEntityListener),
          'AuditEntityListener.java deve usar AuditLogDAO'
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

        // --- Req 17.3, 17.4: AuditREST must have @RolesAllowed("ADMIN") ---
        assert.ok(
          /@RolesAllowed\s*\(\s*"ADMIN"\s*\)/.test(auditREST),
          'AuditREST.java deve ter @RolesAllowed("ADMIN")'
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
          auditEntityListener.includes(pkg.lower),
          'AuditEntityListener.java deve conter o package'
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
