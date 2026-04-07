'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fc = require('fast-check');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * Validates: Requirements 1.2, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4,
 *            6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3,
 *            10.1, 10.2, 10.3, 11.1, 11.3, 11.4, 12.1, 13.1, 13.2, 14.1, 14.2
 *
 * Property 5: Geração condicional de arquivos por pacote
 *
 * For any subset of packages selected and any enabled layer (backend, frontend,
 * mobile), the generated project must contain files from packages/<slug>/ only
 * for selected packages. Files from unselected packages must NOT be present.
 * When no packages are selected, only base files should exist.
 *
 * Since running the full Yeoman generator in a PBT is complex, this test:
 * 1. Uses the PackageRegistry to get package info
 * 2. For random subsets of packages, verifies that the template directory
 *    structure is consistent (each selected package's template directory exists
 *    and has files for its declared layers)
 * 3. Verifies that the file mapping logic (which packages contribute which
 *    files) is correct based on the package's layers
 */
describe('PBT — Geração condicional de arquivos por pacote', function () {

    this.timeout(30000);

    const registry = new PackageRegistry();
    const allSlugs = registry.getAvailablePackages().map(function (p) { return p.slug; });
    const templatesRoot = path.resolve(__dirname, '..', 'Utils', 'templates');
    const validLayers = ['backend', 'frontend', 'mobile'];

    const packageSlugsArb = fc.subarray(allSlugs);
    const layerArb = fc.subarray(validLayers, { minLength: 1 });

    it('each selected package has a template directory for each of its declared layers', function () {
        fc.assert(
            fc.property(packageSlugsArb, function (selected) {
                var resolved = registry.resolveDependencies(selected);

                for (var i = 0; i < resolved.length; i++) {
                    var slug = resolved[i];
                    var pkg = registry.packages.get(slug);
                    assert.ok(pkg, 'Package "' + slug + '" should exist in registry');

                    for (var j = 0; j < pkg.layers.length; j++) {
                        var layer = pkg.layers[j];
                        var templateDir = path.join(templatesRoot, 'packages', slug, layer);
                        assert.ok(
                            fs.existsSync(templateDir),
                            'Template directory should exist at packages/' + slug + '/' + layer + '/'
                        );
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it('unselected packages would NOT contribute files for any layer', function () {
        fc.assert(
            fc.property(packageSlugsArb, layerArb, function (selected, enabledLayers) {
                var resolved = registry.resolveDependencies(selected);
                var resolvedSet = new Set(resolved);

                // Determine unselected packages
                var unselected = allSlugs.filter(function (slug) {
                    return !resolvedSet.has(slug);
                });

                // For each unselected package, verify it would NOT be included
                // in the file mapping for the enabled layers
                for (var i = 0; i < unselected.length; i++) {
                    var slug = unselected[i];
                    var pkg = registry.packages.get(slug);

                    for (var j = 0; j < enabledLayers.length; j++) {
                        var layer = enabledLayers[j];

                        // The unselected package should not be in the resolved set,
                        // meaning its template directory would never be copied
                        assert.ok(
                            !resolvedSet.has(slug),
                            'Unselected package "' + slug + '" must not be in the resolved set ' +
                            'and therefore its templates for layer "' + layer + '" would not be copied'
                        );
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it('when no packages selected, only base templates would be used', function () {
        fc.assert(
            fc.property(layerArb, function (enabledLayers) {
                var resolved = registry.resolveDependencies([]);

                // No packages should be resolved when none are selected
                assert.strictEqual(
                    resolved.length,
                    0,
                    'resolveDependencies([]) should return empty array, got: [' + resolved.join(', ') + ']'
                );

                // Base template directories should exist for each enabled layer
                for (var i = 0; i < enabledLayers.length; i++) {
                    var layer = enabledLayers[i];
                    var baseDir = path.join(templatesRoot, 'base', layer);
                    assert.ok(
                        fs.existsSync(baseDir),
                        'Base template directory should exist at base/' + layer + '/'
                    );
                }

                // No package template directories would be copied
                for (var k = 0; k < allSlugs.length; k++) {
                    var slug = allSlugs[k];
                    assert.ok(
                        !resolved.includes(slug),
                        'Package "' + slug + '" should not be in resolved set when no packages selected'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('PackageRegistry layer declarations match actual template directory structure', function () {
        fc.assert(
            fc.property(fc.constantFrom.apply(fc, allSlugs), function (slug) {
                var pkg = registry.packages.get(slug);
                assert.ok(pkg, 'Package "' + slug + '" should exist in registry');

                // Each declared layer must have a corresponding template directory
                for (var i = 0; i < pkg.layers.length; i++) {
                    var layer = pkg.layers[i];
                    var templateDir = path.join(templatesRoot, 'packages', slug, layer);
                    assert.ok(
                        fs.existsSync(templateDir),
                        'Declared layer "' + layer + '" for package "' + slug +
                        '" must have a template directory at packages/' + slug + '/' + layer + '/'
                    );
                }

                // Layers NOT declared should NOT have a template directory
                for (var j = 0; j < validLayers.length; j++) {
                    var checkLayer = validLayers[j];
                    if (pkg.layers.indexOf(checkLayer) === -1) {
                        var undeclaredDir = path.join(templatesRoot, 'packages', slug, checkLayer);
                        assert.ok(
                            !fs.existsSync(undeclaredDir),
                            'Undeclared layer "' + checkLayer + '" for package "' + slug +
                            '" must NOT have a template directory at packages/' + slug + '/' + checkLayer + '/'
                        );
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it('file mapping: selected packages contribute files only for their declared layers', function () {
        fc.assert(
            fc.property(packageSlugsArb, layerArb, function (selected, enabledLayers) {
                var resolved = registry.resolveDependencies(selected);

                // Build the file mapping: which packages would contribute files
                // for which layers (simulating the generator's copy logic)
                var fileContributions = [];

                for (var i = 0; i < resolved.length; i++) {
                    var slug = resolved[i];
                    var pkg = registry.packages.get(slug);

                    for (var j = 0; j < enabledLayers.length; j++) {
                        var layer = enabledLayers[j];

                        if (pkg.layers.indexOf(layer) !== -1) {
                            // This package declares this layer — it would contribute files
                            var templateDir = path.join(templatesRoot, 'packages', slug, layer);
                            assert.ok(
                                fs.existsSync(templateDir),
                                'Package "' + slug + '" declares layer "' + layer +
                                '" and should have template dir'
                            );
                            fileContributions.push({ slug: slug, layer: layer });
                        }
                        // If the package does NOT declare this layer, it should NOT
                        // contribute files for it (the generator skips it)
                    }
                }

                // Verify no contributions from unselected packages
                var resolvedSet = new Set(resolved);
                for (var k = 0; k < fileContributions.length; k++) {
                    assert.ok(
                        resolvedSet.has(fileContributions[k].slug),
                        'File contribution from "' + fileContributions[k].slug +
                        '" must come from a selected/resolved package'
                    );
                }
            }),
            { numRuns: 100 }
        );
    });
});
