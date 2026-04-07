'use strict';

const assert = require('assert');
const fc = require('fast-check');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * Validates: Requirements 2.1, 15.4
 *
 * Property 4: Completude estrutural do Registro de Pacotes
 *
 * For any package registered in PackageRegistry, the package must have:
 * - slug (non-empty string)
 * - displayName (non-empty string)
 * - description (non-empty string)
 * - dependencies (array)
 * - layers (non-empty array with values in ["backend", "frontend", "mobile"])
 * - mavenDeps (array)
 * - npmDeps (object)
 * - dartDeps (object)
 *
 * Since the registry is a finite set, we use fc.constantFrom to pick
 * random packages and verify their structure across many iterations.
 */
describe('PBT — Completude estrutural do Registro de Pacotes', function () {

    this.timeout(30000);

    const registry = new PackageRegistry();
    const allPackages = registry.getAvailablePackages();
    const validLayers = ['backend', 'frontend', 'mobile'];

    const packageArb = fc.constantFrom(...allPackages);

    it('every registered package has complete structural fields', function () {
        fc.assert(
            fc.property(packageArb, (pkg) => {
                // slug: non-empty string
                assert.strictEqual(typeof pkg.slug, 'string', `slug should be a string, got ${typeof pkg.slug}`);
                assert.ok(pkg.slug.length > 0, 'slug must be non-empty');

                // displayName: non-empty string
                assert.strictEqual(typeof pkg.displayName, 'string', `displayName should be a string, got ${typeof pkg.displayName}`);
                assert.ok(pkg.displayName.length > 0, 'displayName must be non-empty');

                // description: non-empty string
                assert.strictEqual(typeof pkg.description, 'string', `description should be a string, got ${typeof pkg.description}`);
                assert.ok(pkg.description.length > 0, 'description must be non-empty');

                // dependencies: array
                assert.ok(Array.isArray(pkg.dependencies), `dependencies should be an array for package '${pkg.slug}'`);

                // layers: non-empty array with values in ["backend", "frontend", "mobile"]
                assert.ok(Array.isArray(pkg.layers), `layers should be an array for package '${pkg.slug}'`);
                assert.ok(pkg.layers.length > 0, `layers must be non-empty for package '${pkg.slug}'`);
                for (const layer of pkg.layers) {
                    assert.ok(
                        validLayers.includes(layer),
                        `layer '${layer}' in package '${pkg.slug}' is not one of ${JSON.stringify(validLayers)}`
                    );
                }

                // mavenDeps: array
                assert.ok(Array.isArray(pkg.mavenDeps), `mavenDeps should be an array for package '${pkg.slug}'`);

                // npmDeps: object (and not null, not array)
                assert.strictEqual(typeof pkg.npmDeps, 'object', `npmDeps should be an object for package '${pkg.slug}'`);
                assert.ok(pkg.npmDeps !== null, `npmDeps must not be null for package '${pkg.slug}'`);
                assert.ok(!Array.isArray(pkg.npmDeps), `npmDeps must not be an array for package '${pkg.slug}'`);

                // dartDeps: object (and not null, not array)
                assert.strictEqual(typeof pkg.dartDeps, 'object', `dartDeps should be an object for package '${pkg.slug}'`);
                assert.ok(pkg.dartDeps !== null, `dartDeps must not be null for package '${pkg.slug}'`);
                assert.ok(!Array.isArray(pkg.dartDeps), `dartDeps must not be an array for package '${pkg.slug}'`);
            }),
            { numRuns: 100 }
        );
    });
});
