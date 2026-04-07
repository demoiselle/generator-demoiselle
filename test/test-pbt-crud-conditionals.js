'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fc = require('fast-check');
const ejs = require('ejs');

/**
 * **Validates: Requirements 4.1-4.6, 18.1-18.5**
 *
 * Property 6: Condicionais de CRUD por pacote
 *
 * For any valid entity name and any subset of selected packages, the generated
 * CRUD templates must include conditional functionality only for packages that
 * are present:
 * - @EntityListeners(AuditEntityListener.class) present only when 'audit' in packages
 * - Export endpoints present only when 'export' in packages
 * - @RolesAllowed / @Authenticated / @RequiredAnyRole present only when 'auth' in packages
 * - @Counted / @Traced present only when 'observability' in packages
 * - @McpTool present only when 'mcp' in packages
 */
describe('PBT — Condicionais de CRUD por pacote (Property 6)', function () {

    this.timeout(30000);

    const templatesRoot = path.resolve(__dirname, '..', 'Utils', 'templates');

    const entityTemplate = fs.readFileSync(
        path.join(templatesRoot, 'backend', 'src', 'main', 'java', 'app', 'entity', '_pojo.java'),
        'utf-8'
    );

    const restTemplate = fs.readFileSync(
        path.join(templatesRoot, 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java'),
        'utf-8'
    );

    // --- Arbitraries ---

    const allSlugs = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    const packageSlugsArb = fc.subarray(allSlugs);

    const entityNameArb = fc.stringOf(
        fc.constantFrom.apply(fc, 'abcdefghijklmnopqrstuvwxyz'.split('')),
        { minLength: 3, maxLength: 15 }
    ).map(function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    });

    // --- Helpers ---

    function buildContext(entityName, packages) {
        var lower = entityName.toLowerCase();
        var capital = entityName.charAt(0).toUpperCase() + entityName.slice(1);
        return {
            name: { lower: lower, capital: capital },
            package: { lower: 'br.gov.test' },
            project: { lower: 'myproject' },
            packages: packages,
            properties: []
        };
    }

    it('entity template: @EntityListeners present iff audit in packages', function () {
        fc.assert(
            fc.property(entityNameArb, packageSlugsArb, function (entityName, packages) {
                var ctx = buildContext(entityName, packages);
                var rendered = ejs.render(entityTemplate, ctx);
                var hasAudit = packages.indexOf('audit') !== -1;

                if (hasAudit) {
                    assert.ok(
                        /@EntityListeners\s*\(\s*AuditEntityListener\.class\s*\)/.test(rendered),
                        'When audit is selected, @EntityListeners(AuditEntityListener.class) must be present'
                    );
                    assert.ok(
                        /import\s+.*AuditEntityListener/.test(rendered),
                        'When audit is selected, AuditEntityListener import must be present'
                    );
                } else {
                    assert.ok(
                        !/@EntityListeners/.test(rendered),
                        'When audit is NOT selected, @EntityListeners must NOT be present'
                    );
                    assert.ok(
                        !/AuditEntityListener/.test(rendered),
                        'When audit is NOT selected, AuditEntityListener must NOT appear'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('REST template: export endpoints present iff export in packages', function () {
        fc.assert(
            fc.property(entityNameArb, packageSlugsArb, function (entityName, packages) {
                var ctx = buildContext(entityName, packages);
                var rendered = ejs.render(restTemplate, ctx);
                var hasExport = packages.indexOf('export') !== -1;

                if (hasExport) {
                    assert.ok(
                        /@Path\s*\(\s*"export"\s*\)/.test(rendered),
                        'When export is selected, export endpoint must be present'
                    );
                    assert.ok(
                        /exportCsv/.test(rendered),
                        'When export is selected, exportCsv method must be present'
                    );
                    assert.ok(
                        /exportPdf/.test(rendered),
                        'When export is selected, exportPdf method must be present'
                    );
                } else {
                    assert.ok(
                        !/exportCsv/.test(rendered),
                        'When export is NOT selected, exportCsv must NOT be present'
                    );
                    assert.ok(
                        !/exportPdf/.test(rendered),
                        'When export is NOT selected, exportPdf must NOT be present'
                    );
                    assert.ok(
                        !/@Path\s*\(\s*"export"\s*\)/.test(rendered),
                        'When export is NOT selected, export path must NOT be present'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('REST template: auth annotations present iff auth in packages', function () {
        fc.assert(
            fc.property(entityNameArb, packageSlugsArb, function (entityName, packages) {
                var ctx = buildContext(entityName, packages);
                var rendered = ejs.render(restTemplate, ctx);
                var hasAuth = packages.indexOf('auth') !== -1;

                if (hasAuth) {
                    assert.ok(
                        /@Authenticated/.test(rendered),
                        'When auth is selected, @Authenticated must be present'
                    );
                    assert.ok(
                        /@RequiredAnyRole/.test(rendered),
                        'When auth is selected, @RequiredAnyRole must be present'
                    );
                } else {
                    assert.ok(
                        !/@Authenticated/.test(rendered),
                        'When auth is NOT selected, @Authenticated must NOT be present'
                    );
                    assert.ok(
                        !/@RequiredAnyRole/.test(rendered),
                        'When auth is NOT selected, @RequiredAnyRole must NOT be present'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('REST template: observability annotations present iff observability in packages', function () {
        fc.assert(
            fc.property(entityNameArb, packageSlugsArb, function (entityName, packages) {
                var ctx = buildContext(entityName, packages);
                var rendered = ejs.render(restTemplate, ctx);
                var hasObs = packages.indexOf('observability') !== -1;

                if (hasObs) {
                    assert.ok(
                        /@Counted/.test(rendered),
                        'When observability is selected, @Counted must be present'
                    );
                    assert.ok(
                        /@Traced/.test(rendered),
                        'When observability is selected, @Traced must be present'
                    );
                } else {
                    assert.ok(
                        !/@Counted/.test(rendered),
                        'When observability is NOT selected, @Counted must NOT be present'
                    );
                    assert.ok(
                        !/@Traced/.test(rendered),
                        'When observability is NOT selected, @Traced must NOT be present'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('REST template: @McpTool present iff mcp in packages', function () {
        fc.assert(
            fc.property(entityNameArb, packageSlugsArb, function (entityName, packages) {
                var ctx = buildContext(entityName, packages);
                var rendered = ejs.render(restTemplate, ctx);
                var hasMcp = packages.indexOf('mcp') !== -1;

                if (hasMcp) {
                    assert.ok(
                        /@McpTool/.test(rendered),
                        'When mcp is selected, @McpTool must be present'
                    );
                } else {
                    assert.ok(
                        !/@McpTool/.test(rendered),
                        'When mcp is NOT selected, @McpTool must NOT be present'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });
});
