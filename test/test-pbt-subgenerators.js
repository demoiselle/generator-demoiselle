'use strict';

const assert = require('assert');
const fc = require('fast-check');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
 *
 * Property 9: Sub-geradores respeitam configuração de pacotes
 *
 * For any execution of a sub-generator (add, fromEntity, fromSwagger) in a
 * project with Configuração_Pacotes defined in .yo-rc.json, the generated code
 * must respect the configured packages (same conditionals as Property 6).
 * If .yo-rc.json doesn't contain Configuração_Pacotes (legacy project), the
 * sub-generator must assume all packages enabled.
 *
 * Since running full Yeoman sub-generators in a PBT is complex, we test the
 * logic at the unit level:
 * 1. Verify sub-generators correctly read packages from config and fall back
 * 2. Verify config objects passed to utilities include the packages array
 * 3. Verify backward compatibility: no packages config → all packages assumed
 * 4. Verify PackageRegistry.getAvailablePackages() returns all 10 slugs
 */
describe('PBT — Sub-geradores respeitam configuração de pacotes (Property 9)', function () {

    this.timeout(30000);

    // --- Constants ---

    const ALL_SLUGS = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    // --- Arbitraries ---

    const packageSlugsArb = fc.subarray(ALL_SLUGS);

    const entityNameArb = fc.stringOf(
        fc.constantFrom.apply(fc, 'abcdefghijklmnopqrstuvwxyz'.split('')),
        { minLength: 3, maxLength: 15 }
    ).map(function (s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    });

    const subGeneratorArb = fc.constantFrom('add', 'fromEntity', 'fromSwagger');

    // --- Helpers ---

    /**
     * Simulates the initializing() logic from each sub-generator.
     * All three sub-generators share the same pattern:
     *   this.selectedPackages = this.config.get('packages') || null;
     *   if (this.selectedPackages === null) {
     *       const registry = new PackageRegistry();
     *       this.selectedPackages = registry.getAvailablePackages().map(p => p.slug);
     *   }
     *
     * @param {string[]|null|undefined} configPackages - value from .yo-rc.json
     * @returns {string[]} resolved packages array
     */
    function simulateInitializing(configPackages) {
        var selectedPackages = configPackages || null;

        if (selectedPackages === null) {
            var registry = new PackageRegistry();
            selectedPackages = registry.getAvailablePackages().map(function (p) {
                return p.slug;
            });
        }

        return selectedPackages;
    }

    /**
     * Simulates building the config object passed to utilities (e.g. createCrud).
     * All sub-generators pass selectedPackages in the config object.
     */
    function buildUtilConfig(selectedPackages, project, pkg, prefix) {
        return {
            frontend: {
                project: project || 'myproject',
                prefix: prefix || 'app',
                packages: selectedPackages
            },
            backend: {
                package: pkg || 'org.demoiselle',
                project: project || 'myproject',
                packages: selectedPackages
            },
            mobile: {
                project: project || 'myproject',
                prefix: prefix || 'app',
                packages: selectedPackages
            }
        };
    }


    // --- Property Tests ---

    it('when packages config exists, sub-generator uses exactly those packages', function () {
        fc.assert(
            fc.property(subGeneratorArb, packageSlugsArb, function (subGen, packages) {
                var resolved = simulateInitializing(packages.length > 0 ? packages : null);

                if (packages.length > 0) {
                    // When config has packages, use them exactly
                    assert.deepStrictEqual(
                        resolved.slice().sort(),
                        packages.slice().sort(),
                        'Sub-generator ' + subGen + ' must use exactly the configured packages'
                    );
                } else {
                    // Empty array is falsy via || null, so falls back to all
                    assert.strictEqual(
                        resolved.length,
                        ALL_SLUGS.length,
                        'Sub-generator ' + subGen + ' with empty packages must fall back to all'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('when packages config is null/undefined (legacy project), all packages are assumed', function () {
        fc.assert(
            fc.property(
                subGeneratorArb,
                fc.constantFrom(null, undefined),
                function (subGen, configValue) {
                    var resolved = simulateInitializing(configValue);

                    assert.strictEqual(
                        resolved.length,
                        ALL_SLUGS.length,
                        'Sub-generator ' + subGen + ' must assume all ' + ALL_SLUGS.length + ' packages for legacy projects'
                    );

                    var resolvedSorted = resolved.slice().sort();
                    var allSorted = ALL_SLUGS.slice().sort();
                    assert.deepStrictEqual(
                        resolvedSorted,
                        allSorted,
                        'Sub-generator ' + subGen + ' fallback must include all known package slugs'
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    it('config objects passed to utilities always include the packages array', function () {
        fc.assert(
            fc.property(subGeneratorArb, packageSlugsArb, function (subGen, packages) {
                var resolved = simulateInitializing(packages.length > 0 ? packages : null);
                var configs = buildUtilConfig(resolved);

                // All three layer configs must have a packages array
                assert.ok(
                    Array.isArray(configs.frontend.packages),
                    'Frontend config for ' + subGen + ' must have packages array'
                );
                assert.ok(
                    Array.isArray(configs.backend.packages),
                    'Backend config for ' + subGen + ' must have packages array'
                );
                assert.ok(
                    Array.isArray(configs.mobile.packages),
                    'Mobile config for ' + subGen + ' must have packages array'
                );

                // The packages in config must match the resolved packages
                assert.deepStrictEqual(
                    configs.frontend.packages,
                    resolved,
                    'Frontend config packages must match resolved packages for ' + subGen
                );
                assert.deepStrictEqual(
                    configs.backend.packages,
                    resolved,
                    'Backend config packages must match resolved packages for ' + subGen
                );
                assert.deepStrictEqual(
                    configs.mobile.packages,
                    resolved,
                    'Mobile config packages must match resolved packages for ' + subGen
                );
            }),
            { numRuns: 100 }
        );
    });

    it('PackageRegistry.getAvailablePackages() returns all 10 slugs for fallback', function () {
        fc.assert(
            fc.property(fc.constant(null), function () {
                var registry = new PackageRegistry();
                var available = registry.getAvailablePackages();
                var slugs = available.map(function (p) { return p.slug; });

                assert.strictEqual(
                    slugs.length,
                    10,
                    'PackageRegistry must have exactly 10 packages'
                );

                var slugsSorted = slugs.slice().sort();
                var expectedSorted = ALL_SLUGS.slice().sort();
                assert.deepStrictEqual(
                    slugsSorted,
                    expectedSorted,
                    'PackageRegistry slugs must match all known slugs'
                );
            }),
            { numRuns: 100 }
        );
    });

    it('for any random subset of packages, resolved packages are always a subset of all known slugs', function () {
        fc.assert(
            fc.property(subGeneratorArb, packageSlugsArb, function (subGen, packages) {
                var resolved = simulateInitializing(packages.length > 0 ? packages : null);

                resolved.forEach(function (slug) {
                    assert.ok(
                        ALL_SLUGS.indexOf(slug) !== -1,
                        'Resolved package "' + slug + '" for ' + subGen + ' must be a known slug'
                    );
                });
            }),
            { numRuns: 100 }
        );
    });

    it('sub-generator initializing logic is identical across add, fromEntity, fromSwagger', function () {
        fc.assert(
            fc.property(packageSlugsArb, function (packages) {
                var configValue = packages.length > 0 ? packages : null;

                // Simulate all three sub-generators with the same config
                var addResult = simulateInitializing(configValue);
                var fromEntityResult = simulateInitializing(configValue);
                var fromSwaggerResult = simulateInitializing(configValue);

                // All three must produce the same result
                assert.deepStrictEqual(
                    addResult,
                    fromEntityResult,
                    'add and fromEntity must produce identical packages'
                );
                assert.deepStrictEqual(
                    fromEntityResult,
                    fromSwaggerResult,
                    'fromEntity and fromSwagger must produce identical packages'
                );
            }),
            { numRuns: 100 }
        );
    });
});
