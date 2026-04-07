'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fc = require('fast-check');
const ejs = require('ejs');

/**
 * **Validates: Requirements 9.4, 9.5**
 *
 * Property 7: Interação entre pacotes Audit e Auth
 *
 * For any project generated with Pacote_Audit selected:
 * - If Pacote_Auth is also selected, the /audit endpoint must contain
 *   @RequiredRole({"ADMIN"}) (or @RolesAllowed("ADMIN"))
 * - If Pacote_Auth is NOT selected, the /audit endpoint must be generated
 *   without access restriction (no @RequiredRole, no @Authenticated)
 */
describe('PBT — Interação entre pacotes Audit e Auth (Property 7)', function () {

    this.timeout(30000);

    var templatesRoot = path.resolve(__dirname, '..', 'Utils', 'templates');

    var auditRESTTemplate = fs.readFileSync(
        path.join(templatesRoot, 'packages', 'audit', 'backend',
            'src', 'main', 'java', 'app', 'service', 'AuditREST.java'),
        'utf-8'
    );

    // --- Arbitraries ---

    var projectArb = fc.stringOf(
        fc.constantFrom.apply(fc, 'abcdefghijklmnopqrstuvwxyz'.split('')),
        { minLength: 3, maxLength: 12 }
    ).map(function (s) {
        return {
            lower: s,
            capital: s.charAt(0).toUpperCase() + s.slice(1)
        };
    });

    var packageArb = fc.constantFrom(
        'br.gov.test', 'com.example', 'org.demo', 'br.com.app'
    ).map(function (lower) {
        return {
            lower: lower,
            capital: lower.split('.').map(function (seg) {
                return seg.charAt(0).toUpperCase() + seg.slice(1);
            }).join('.')
        };
    });

    // Boolean arbitrary for whether auth is included
    var authSelectedArb = fc.boolean();

    // --- Helpers ---

    function buildPackages(hasAuth) {
        // audit is always present (this property only applies when audit is selected)
        var pkgs = ['audit'];
        if (hasAuth) {
            pkgs.push('auth');
        }
        return pkgs;
    }

    it('when both audit and auth selected: @RequiredRole({"ADMIN"}) must be present', function () {
        fc.assert(
            fc.property(projectArb, packageArb, function (project, pkg) {
                var packages = buildPackages(true);
                var rendered = ejs.render(auditRESTTemplate, {
                    project: project,
                    package: pkg,
                    packages: packages
                });

                assert.ok(
                    /@RequiredRole\s*\(\s*\{[^}]*"ADMIN"[^}]*\}\s*\)/.test(rendered),
                    'When audit+auth selected, AuditREST must have @RequiredRole({"ADMIN"})'
                );
                assert.ok(
                    /@Authenticated/.test(rendered),
                    'When audit+auth selected, AuditREST must have @Authenticated'
                );
            }),
            { numRuns: 100 }
        );
    });

    it('when audit selected but auth NOT selected: no access restriction', function () {
        fc.assert(
            fc.property(projectArb, packageArb, function (project, pkg) {
                var packages = buildPackages(false);
                var rendered = ejs.render(auditRESTTemplate, {
                    project: project,
                    package: pkg,
                    packages: packages
                });

                assert.ok(
                    !/@RequiredRole/.test(rendered),
                    'When audit selected without auth, AuditREST must NOT have @RequiredRole'
                );
                assert.ok(
                    !/@Authenticated/.test(rendered),
                    'When audit selected without auth, AuditREST must NOT have @Authenticated'
                );
            }),
            { numRuns: 100 }
        );
    });

    it('auth conditional is consistent across random combinations', function () {
        fc.assert(
            fc.property(projectArb, packageArb, authSelectedArb, function (project, pkg, hasAuth) {
                var packages = buildPackages(hasAuth);
                var rendered = ejs.render(auditRESTTemplate, {
                    project: project,
                    package: pkg,
                    packages: packages
                });

                var hasRolesAllowed = /@RequiredRole/.test(rendered);
                var hasAuthenticated = /@Authenticated/.test(rendered);

                if (hasAuth) {
                    assert.ok(
                        hasRolesAllowed && hasAuthenticated,
                        'With auth: both @RequiredRole and @Authenticated must be present'
                    );
                } else {
                    assert.ok(
                        !hasRolesAllowed && !hasAuthenticated,
                        'Without auth: neither @RequiredRole nor @Authenticated should be present'
                    );
                }

                // Regardless of auth, the audit endpoint path must always be present
                assert.ok(
                    /@Path\s*\(\s*"audit"\s*\)/.test(rendered),
                    'AuditREST must always have @Path("audit")'
                );

                // The @GET endpoint must always be present
                assert.ok(
                    /@GET/.test(rendered),
                    'AuditREST must always have @GET endpoint'
                );
            }),
            { numRuns: 100 }
        );
    });
});
