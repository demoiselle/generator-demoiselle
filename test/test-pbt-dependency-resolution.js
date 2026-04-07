'use strict';

const assert = require('assert');
const fc = require('fast-check');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * Validates: Requirements 1.3, 2.2, 2.3
 *
 * Property 1: Resolução de dependências completa e consistente
 *
 * For any subset of packages selected from the registry,
 * resolveDependencies() must return a superset that includes all selected
 * packages and all their transitive dependencies. Additionally, validate()
 * must return valid: true for the resolved set, and valid: false for any
 * subset of the result that removes a required dependency.
 */
describe('PBT — Resolução de dependências completa e consistente', function () {

    this.timeout(30000);

    const allSlugs = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    const packageSlugsArb = fc.subarray(allSlugs);

    /**
     * Helper: collect all transitive dependencies for a set of slugs.
     */
    function allTransitiveDeps(registry, slugs) {
        const result = new Set();
        const visit = (slug) => {
            if (result.has(slug)) return;
            const pkg = registry.packages.get(slug);
            if (!pkg) return;
            result.add(slug);
            for (const dep of pkg.dependencies) {
                visit(dep);
            }
        };
        for (const s of slugs) visit(s);
        return result;
    }

    it('resolveDependencies returns a superset of selected packages and all transitive deps', function () {
        const registry = new PackageRegistry();

        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);
                const resolvedSet = new Set(resolved);

                // 1. Every selected package must be in the resolved set
                for (const slug of selected) {
                    assert.ok(
                        resolvedSet.has(slug),
                        `Selected package '${slug}' missing from resolved set`
                    );
                }

                // 2. Every transitive dependency must be in the resolved set
                const expectedDeps = allTransitiveDeps(registry, selected);
                for (const dep of expectedDeps) {
                    assert.ok(
                        resolvedSet.has(dep),
                        `Transitive dependency '${dep}' missing from resolved set`
                    );
                }

                // 3. Resolved set must not contain duplicates
                assert.strictEqual(
                    resolved.length,
                    resolvedSet.size,
                    'Resolved array contains duplicates'
                );
            }),
            { numRuns: 100 }
        );
    });

    it('validate returns valid: true for the resolved set', function () {
        const registry = new PackageRegistry();

        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);
                const validation = registry.validate(resolved);

                assert.strictEqual(
                    validation.valid,
                    true,
                    `validate() should be valid for resolved set [${resolved}], errors: ${validation.errors.join('; ')}`
                );
            }),
            { numRuns: 100 }
        );
    });

    it('validate returns valid: false when a required dependency is removed from the resolved set', function () {
        const registry = new PackageRegistry();

        // Only test with selections that produce at least one dependency edge
        const slugsWithDepsArb = packageSlugsArb.filter((selected) => {
            const resolved = registry.resolveDependencies(selected);
            // Find at least one package in resolved that has a dependency also in resolved
            return resolved.some((slug) => {
                const pkg = registry.packages.get(slug);
                return pkg && pkg.dependencies.length > 0 &&
                    pkg.dependencies.some((dep) => resolved.includes(dep));
            });
        });

        fc.assert(
            fc.property(slugsWithDepsArb, (selected) => {
                const resolved = registry.resolveDependencies(selected);

                // Find a package that has a required dependency in the resolved set
                for (const slug of resolved) {
                    const pkg = registry.packages.get(slug);
                    if (pkg && pkg.dependencies.length > 0) {
                        for (const dep of pkg.dependencies) {
                            if (resolved.includes(dep)) {
                                // Remove the dependency from the resolved set
                                const broken = resolved.filter((s) => s !== dep);
                                const validation = registry.validate(broken);

                                assert.strictEqual(
                                    validation.valid,
                                    false,
                                    `validate() should be invalid when '${dep}' (required by '${slug}') is removed from [${resolved}]`
                                );
                                return; // One check per selection is sufficient
                            }
                        }
                    }
                }
            }),
            { numRuns: 100 }
        );
    });
});
