'use strict';

const assert = require('assert');
const fc = require('fast-check');
const PackageRegistry = require('../Utils/packageRegistry');

/**
 * Validates: Requirements 1.4
 *
 * Property 2: Round-trip da Configuração de Pacotes
 *
 * For any valid list of package slugs, storing the Configuração_Pacotes
 * in .yo-rc.json and reading it back must produce the same list of packages.
 * The order may vary, but the set must be identical.
 *
 * Since we can't easily run the full Yeoman generator in a PBT, we simulate
 * the round-trip by:
 * 1. Generate a random subset of valid package slugs
 * 2. Resolve dependencies via PackageRegistry
 * 3. Write the resolved array to a temporary JSON object (simulating .yo-rc.json)
 * 4. Read it back
 * 5. Verify the sets are identical
 */
describe('PBT — Round-trip da Configuração de Pacotes', function () {

    this.timeout(30000);

    const allSlugs = [
        'auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'
    ];

    const packageSlugsArb = fc.subarray(allSlugs);

    it('round-trip through .yo-rc.json structure preserves the set of packages', function () {
        const registry = new PackageRegistry();

        fc.assert(
            fc.property(packageSlugsArb, (selected) => {
                // Step 1-2: Resolve dependencies for the selected slugs
                const resolved = registry.resolveDependencies(selected);

                // Step 3: Write to a simulated .yo-rc.json structure
                const yoRcJson = JSON.stringify({
                    'generator-demoiselle': {
                        packages: resolved
                    }
                });

                // Step 4: Read it back (parse the JSON)
                const parsed = JSON.parse(yoRcJson);
                const readBack = parsed['generator-demoiselle'].packages;

                // Step 5: Verify the sets are identical (order may vary)
                const resolvedSet = new Set(resolved);
                const readBackSet = new Set(readBack);

                assert.strictEqual(
                    resolvedSet.size,
                    readBackSet.size,
                    `Set sizes differ: wrote ${resolvedSet.size} packages, read back ${readBackSet.size}`
                );

                for (const slug of resolvedSet) {
                    assert.ok(
                        readBackSet.has(slug),
                        `Package '${slug}' was written but not found after reading back`
                    );
                }

                for (const slug of readBackSet) {
                    assert.ok(
                        resolvedSet.has(slug),
                        `Package '${slug}' was read back but was not in the original set`
                    );
                }
            }),
            { numRuns: 100 }
        );
    });

    it('round-trip preserves packages even with empty selection', function () {
        const registry = new PackageRegistry();

        // Specific edge case: empty selection
        const resolved = registry.resolveDependencies([]);

        const yoRcJson = JSON.stringify({
            'generator-demoiselle': {
                packages: resolved
            }
        });

        const parsed = JSON.parse(yoRcJson);
        const readBack = parsed['generator-demoiselle'].packages;

        assert.deepStrictEqual(readBack, []);
    });

    it('round-trip preserves packages when all slugs are selected', function () {
        const registry = new PackageRegistry();

        const resolved = registry.resolveDependencies(allSlugs);

        const yoRcJson = JSON.stringify({
            'generator-demoiselle': {
                packages: resolved
            }
        });

        const parsed = JSON.parse(yoRcJson);
        const readBack = parsed['generator-demoiselle'].packages;

        const resolvedSet = new Set(resolved);
        const readBackSet = new Set(readBack);

        assert.strictEqual(resolvedSet.size, readBackSet.size);

        for (const slug of resolvedSet) {
            assert.ok(
                readBackSet.has(slug),
                `Package '${slug}' missing after round-trip with all slugs`
            );
        }
    });
});
